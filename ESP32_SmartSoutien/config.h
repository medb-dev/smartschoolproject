// ================================================================
//  config.h — SmartSoutien ESP32
//  ⚠️  Modifier uniquement ce fichier avant de flasher
// ================================================================
#ifndef CONFIG_H
#define CONFIG_H

// ── WiFi ─────────────────────────────────────────────────────
#define WIFI_SSID         "ADSL_inwi_2.4G_FE2F" //NOM_DE_VOTRE_WIFI
#define WIFI_PASSWORD     "C049432BFE2F" //MOT_DE_PASSE_WIFI

// ── Firebase Project ─────────────────────────────────────────
// Trouvez ces valeurs dans : Firebase Console → Project Settings
#define FIREBASE_API_KEY      "AIzaSyCWBMzL_571sfTQlpTzSLdLXGAzoVJLG0Y"//"AIzaSyCdLCX4OCOVf-D114hWpDFud6EGvxwSynU" //VOTRE_API_KEY
#define FIREBASE_PROJECT_ID   "smartsoutien"

// ── Compte Firebase dédié ESP32 ──────────────────────────────
// Créez ce compte dans : Authentication → Add user
#define FIREBASE_EMAIL        "esp32@smartsoutien.ma"
#define FIREBASE_PASSWORD     "Esp32Pass123!"

// ── Identité du dispositif ───────────────────────────────────
// Changer pour chaque ESP32 (une par salle)
#define DEVICE_ID       "ESP32-A"
#define DEVICE_ROOM     "Salle A"
#define DEVICE_SUBJECT  "Mathematiques"

// ── Cours actif par défaut ───────────────────────────────────
// Ces IDs correspondent aux documents Firestore
#define COURSE_ID   "cours_math_A"
#define SESSION_ID  "session_001"

// ── Broches ESP32 ────────────────────────────────────────────
// MFRC522 (SPI)
#define NFC_SS_PIN    5    // SDA
#define NFC_RST_PIN   27   // RST
// SPI automatique : SCK=18, MISO=19, MOSI=23

// LCD I2C 16x2
#define LCD_ADDR  0x27     //#define LCD_ADDR  0x3F // Essayer 0x3F si l'écran ne s'affiche pas
#define LCD_COLS  16
#define LCD_ROWS  2
// I2C automatique : SDA=21, SCL=22

// Buzzer & LEDs
#define PIN_BUZZER    26
#define PIN_LED_RED   25
#define PIN_LED_GREEN 33
#define PIN_LED_BLUE  32

// ── Timing (ms) ──────────────────────────────────────────────
#define SCAN_COOLDOWN       3000   // Anti-doublon entre 2 scans
#define MSG_DISPLAY_TIME    2500   // Durée affichage LCD
#define WIFI_TIMEOUT        15000  // Timeout connexion WiFi
#define HTTP_TIMEOUT        8000   // Timeout requête HTTP
#define HEARTBEAT_INTERVAL  30000  // Statut envoyé toutes les 30s
#define BUZZ_OK_MS          150    // Durée bip succès
#define BUZZ_ERR_MS         500    // Durée bip erreur

#endif
