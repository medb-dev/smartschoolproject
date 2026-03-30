// ================================================================
//  ESP32_SmartSoutien.ino — Sketch principal
//
//  FLUX :
//  1. Démarrage → WiFi → Firebase Auth
//  2. Boucle : lire badge NFC
//  3. Vérifier badge dans Firestore (badges/{UID})
//  4. Si valide → enregistrer présence → LCD OK + bip vert
//  5. Si inconnu → LCD refusé + bip rouge
//  6. Toutes les 30s → envoyer heartbeat (statut device)
//
//  SCHÉMA DE CÂBLAGE :
//  ┌─────────────┬──────────┬──────────────┐
//  │ Composant   │ ESP32    │ Note         │
//  ├─────────────┼──────────┼──────────────┤
//  │ MFRC522 SDA │ GPIO 5   │ Chip Select  │
//  │ MFRC522 SCK │ GPIO 18  │ SPI Clock    │
//  │ MFRC522 MOSI│ GPIO 23  │ SPI MOSI     │
//  │ MFRC522 MISO│ GPIO 19  │ SPI MISO     │
//  │ MFRC522 RST │ GPIO 27  │ Reset        │
//  │ MFRC522 3.3V│ 3.3V     │ Alimentation │
//  │ MFRC522 GND │ GND      │              │
//  ├─────────────┼──────────┼──────────────┤
//  │ LCD SDA     │ GPIO 21  │ I2C Data     │
//  │ LCD SCL     │ GPIO 22  │ I2C Clock    │
//  │ LCD VCC     │ 5V       │ Alimentation │
//  │ LCD GND     │ GND      │              │
//  ├─────────────┼──────────┼──────────────┤
//  │ Buzzer +    │ GPIO 26  │ Via résistance│
//  │ LED R       │ GPIO 25  │ Via 220Ω     │
//  │ LED G       │ GPIO 33  │ Via 220Ω     │
//  │ LED B       │ GPIO 32  │ Via 220Ω     │
//  └─────────────┴──────────┴──────────────┘
//
//  LIBRARIES REQUISES (Tools → Manage Libraries) :
//  - MFRC522 by GithubCommunity
//  - LiquidCrystal I2C by Frank de Brabander
//  - ArduinoJson by Benoit Blanchon (v6.x)
//  - WiFi (inclus ESP32 board)
//
//  BOARD : ESP32 Dev Module
//  Upload Speed : 115200
// ================================================================

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ArduinoJson.h>
#include <Preferences.h>

#include "config.h"
#include "hardware.h"
#include "firebase.h"
#include "wifi_manager.h"
#include "nfc.h"

// ── Objets globaux (définis ici, extern dans les .h) ─────────
MFRC522          nfc(NFC_SS_PIN, NFC_RST_PIN);
LiquidCrystal_I2C lcd(LCD_ADDR, LCD_COLS, LCD_ROWS);
Preferences      prefs;

// ── Variables Firebase globales (utilisées dans firebase.h) ──
String       g_firebase_token = "";
unsigned long g_token_expiry  = 0;

// ── État interne ─────────────────────────────────────────────
String        lastUID         = "";
unsigned long lastScanTime    = 0;
unsigned long lastHeartbeat   = 0;
int           totalScans      = 0;
bool          systemReady     = false;

// ================================================================
//  SETUP
// ================================================================
void setup() {
  Serial.begin(115200);
  Serial.println("\n=============================");
  Serial.println("  SmartSoutien ESP32 v2.1");
  Serial.println("  Device: " + String(DEVICE_ID));
  Serial.println("  Room:   " + String(DEVICE_ROOM));
  Serial.println("=============================\n");

  // ── Init broches ────────────────────────────────────────
  pinMode(PIN_BUZZER,    OUTPUT);
  pinMode(PIN_LED_RED,   OUTPUT);
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_LED_BLUE,  OUTPUT);
  ledOff();
  digitalWrite(PIN_BUZZER, LOW);

  // ── Init LCD ─────────────────────────────────────────────
  Wire.begin();
  lcd.init();
  lcd.backlight();
  lcdShow("SmartSoutien", "Demarrage v2.1");
  buzzerStartup();
  delay(800);

  // ── Init NFC ─────────────────────────────────────────────
  SPI.begin();
  nfc.PCD_Init();
  delay(100);

  if (!testNFC()) {
    lcdShow("ERREUR NFC", "Verif cablage!");
    ledRed();
    // Continuer quand même pour tester le reste
  } else {
    Serial.println("[NFC] Module OK");
  }

  // ── NVS : charger compteur local ─────────────────────────
  prefs.begin("soutien", false);
  totalScans = prefs.getInt("scans", 0);
  Serial.println("[NVS] Scans stockés: " + String(totalScans));

  // ── Connexion WiFi ───────────────────────────────────────
  if (!wifiConnect()) {
    // Mode hors-ligne : continuer sans Firebase
    lcdShow("Mode hors-ligne", "WiFi requis");
    delay(2000);
    systemReady = false;
  } else {
    // ── Authentification Firebase ───────────────────────
    lcdShow("Firebase Auth", "Connexion...");
    ledBlue();

    if (!firebaseLogin()) {
      lcdShow("Firebase ERREUR", "Verif config.h");
      ledRed();
      buzzerError();
      delay(2000);
      systemReady = false;
    } else {
      // ── Marquer device online dans Firestore ─────────
      updateDeviceOnline();
      systemReady = true;
      lcdShow("Systeme pret!", DEVICE_ROOM);
      ledGreen();
      buzzerOK();
      delay(1500);
      ledOff();
    }
  }

  // Afficher l'écran d'attente
  showStandby();
}

// ================================================================
//  LOOP
// ================================================================
void loop() {
  // ── Vérifier WiFi ────────────────────────────────────────
  if (!wifiCheck()) {
    systemReady = false;
    lcdShow("WiFi perdu...", "Reconnexion");
    delay(3000);
    return;
  }

  // ── Heartbeat (statut device toutes les 30s) ─────────────
  if (millis() - lastHeartbeat > HEARTBEAT_INTERVAL) {
    sendHeartbeat();
    lastHeartbeat = millis();
  }

  // ── Lecture badge NFC ────────────────────────────────────
  String uid = readUID();

  if (uid == "") {
    // Pas de badge → animation attente
    static unsigned long lastAnim = 0;
    if (millis() - lastAnim > 800) {
      animateScanning();
      lastAnim = millis();
    }
    return;
  }

  // ── Badge détecté ────────────────────────────────────────
  Serial.println("\n[NFC] Badge détecté: " + uid);

  // Anti-doublon
  if (isDoubleScan(uid, lastUID, lastScanTime)) {
    Serial.println("[NFC] Double scan ignoré");
    showAlreadyScanned("...");
    showStandby();
    return;
  }

  // Animation "traitement en cours"
  lcdShow("Verification...", uid.substring(0, 16));
  ledBlue();

  if (!systemReady) {
    // Mode hors-ligne : stocker localement
    handleOfflineScan(uid);
    return;
  }

  // ── Vérifier le badge dans Firestore ─────────────────────
  String studentName   = "";
  String studentStatus = "";
  bool   badgeValid    = checkBadge(uid, studentName, studentStatus);

  if (!badgeValid) {
    // Badge inconnu
    Serial.println("[Badge] Inconnu: " + uid);
    showWelcome("Inconnu", false);
    logScan(uid, "unknown", false);
  } else if (studentStatus == "inactive") {
    // Étudiant inactif
    Serial.println("[Badge] Inactif: " + studentName);
    lcdShow("Compte inactif", studentName.substring(0, 16));
    ledRed();
    buzzerDeny();
    delay(MSG_DISPLAY_TIME);
    ledOff();
  } else if (studentStatus == "payment_pending") {
    // Paiement en attente — accès autorisé mais avertissement
    Serial.println("[Badge] Paiement en attente: " + studentName);
    showPaymentWarning(studentName);
    recordAttendance(uid, studentName, "present_unpaid");
  } else {
    // Accès autorisé
    Serial.println("[Badge] Accès autorisé: " + studentName);
    showWelcome(studentName, true);
    recordAttendance(uid, studentName, "present");
    totalScans++;
    prefs.putInt("scans", totalScans);
  }

  showStandby();
}

// ================================================================
//  FONCTIONS MÉTIER
// ================================================================

// ── Vérifier badge dans Firestore ────────────────────────────
bool checkBadge(String uid, String &studentName, String &studentStatus) {
  // GET badges/{UID} dans Firestore
  String response = firestoreGet("badges", uid);
  if (response == "") return false;

  DynamicJsonDocument doc(2048);
  DeserializationError err = deserializeJson(doc, response);
  if (err) {
    Serial.println("[Badge] JSON erreur: " + String(err.c_str()));
    return false;
  }

  // Vérifier que le document existe et est actif
  if (!doc["fields"].containsKey("studentId")) return false;

  bool isActive = doc["fields"]["isActive"]["booleanValue"] | false;
  if (!isActive) {
    studentStatus = "inactive";
    return true;
  }

  // Récupérer les infos de l'étudiant
  String studentId = doc["fields"]["studentId"]["stringValue"].as<String>();

  String studentResponse = firestoreGet("students", studentId);
  if (studentResponse != "") {
    DynamicJsonDocument sDoc(2048);
    deserializeJson(sDoc, studentResponse);
    studentName   = sDoc["fields"]["name"]["stringValue"]          | "Etudiant";
    String payStatus = sDoc["fields"]["paymentStatus"]["stringValue"] | "paid";

    if (payStatus == "pending" || payStatus == "overdue") {
      studentStatus = "payment_pending";
    } else {
      studentStatus = "active";
    }
  }

  return true;
}

// ── Enregistrer présence dans Firestore ──────────────────────
bool recordAttendance(String uid, String studentName, String status) {
  // POST vers courses/{courseId}/sessions/{sessionId}/attendances
  String collection = "courses/" + String(COURSE_ID) +
                      "/sessions/" + String(SESSION_ID) +
                      "/attendances";

  // Obtenir l'heure actuelle (simplifiée)
  String timestamp = String(millis());

  String fields =
    fsStr("studentName",    studentName)  + "," +
    fsStr("badgeUID",       uid)          + "," +
    fsStr("status",         status)       + "," +
    fsStr("deviceId",       DEVICE_ID)   + "," +
    fsStr("room",           DEVICE_ROOM)  + "," +
    fsStr("source",         "nfc")        + "," +
    fsStr("scannedAt",      timestamp);

  String body = firestoreBuildDoc(fields);
  bool ok = firestorePost(collection, body);

  if (ok) {
    Serial.println("[Attendance] Enregistré: " + studentName + " → " + status);
  }
  return ok;
}

// ── Log scan non reconnu ──────────────────────────────────────
void logScan(String uid, String type, bool allowed) {
  String collection = "scan_logs";
  String fields =
    fsStr("uid",       uid)            + "," +
    fsStr("type",      type)           + "," +
    fsBool("allowed",  allowed)        + "," +
    fsStr("deviceId",  DEVICE_ID)     + "," +
    fsStr("timestamp", String(millis()));

  firestorePost(collection, firestoreBuildDoc(fields));
}

// ── Mettre à jour statut device dans Firestore ───────────────
// void updateDeviceOnline() {
//   String fields =
//     fsStr("status",     "online")         + "," +
//     fsStr("deviceId",   DEVICE_ID)       + "," +
//     fsStr("room",       DEVICE_ROOM)      + "," +
//     fsStr("subject",    DEVICE_SUBJECT)   + "," +
//     fsStr("ip",         WiFi.localIP().toString()) + "," +
//     fsStr("firmware",   "v2.1.0")         + "," +
//     fsInt("rssi",       WiFi.RSSI())      + "," +
//     fsStr("lastSeen",   String(millis()));

//   firestorePatch("devices", String(DEVICE_ID),
//                  firestoreBuildDoc(fields));
//   Serial.println("[Device] Statut online envoyé");
// }
void updateDeviceOnline() {
  String fields =
    fsStr("status",     "online")               + "," +
    fsStr("deviceId",   DEVICE_ID)              + "," +
    fsStr("room",       DEVICE_ROOM)            + "," +
    fsStr("subject",    DEVICE_SUBJECT)         + "," +
    fsStr("ip",         WiFi.localIP().toString()) + "," +
    fsStr("firmware",   "v2.1.0")               + "," +
    fsInt("rssi",       WiFi.RSSI())            + "," +
    fsStr("lastSeen",   String(millis()));

  // Essayer PATCH d'abord, si 403 → ignorer (document peut ne pas exister)
  bool ok = firestorePatch("devices", String(DEVICE_ID),firestoreBuildDoc(fields));
  if (!ok) {
    Serial.println("[Device] PATCH échoué, création du document...");
    firestorePost("devices", firestoreBuildDoc(fields));
  }
  Serial.println("[Device] Statut online envoyé");
}

// ── Heartbeat périodique ─────────────────────────────────────
void sendHeartbeat() {
  String fields =
    fsStr("status",     "online")           + "," +
    fsInt("totalScans", totalScans)          + "," +
    fsInt("rssi",       WiFi.RSSI())        + "," +
    fsStr("lastSeen",   String(millis()));

  bool ok = firestorePatch("devices", String(DEVICE_ID),
                           firestoreBuildDoc(fields));

  Serial.println("[Heartbeat] " + String(ok ? "OK" : "ERREUR") +
                 " | Scans: " + String(totalScans) +
                 " | RSSI: " + String(WiFi.RSSI()) + "dBm");
}

// ── Mode hors-ligne : stocker UID localement ─────────────────
void handleOfflineScan(String uid) {
  // Stocker les scans en attente dans NVS
  // (seront envoyés à la prochaine connexion)
  String key = "pending_" + String(millis() % 10000);
  prefs.putString(key.c_str(), uid);

  lcdShow("Mode hors-ligne", "Scan enregistre");
  ledYellow();
  buzz(200);
  delay(1500);
  ledOff();
  Serial.println("[Offline] Scan stocké localement: " + uid);
  showStandby();
}

// ── Afficher écran d'attente ──────────────────────────────────
void showStandby() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(DEVICE_ROOM);
  lcd.setCursor(0, 1);
  lcd.print("Approchez badge ");
}
