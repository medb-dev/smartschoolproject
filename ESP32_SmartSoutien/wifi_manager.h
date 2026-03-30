// ================================================================
//  wifi_manager.h — Gestion connexion WiFi avec reconnexion auto
// ================================================================
#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <WiFi.h>
#include "config.h"
#include "hardware.h"

// ── Connexion WiFi initiale ───────────────────────────────────
bool wifiConnect() {
  Serial.print("[WiFi] Connexion à: ");
  Serial.println(WIFI_SSID);

  lcdShow("Connexion WiFi", String(WIFI_SSID).substring(0, 16));
  ledBlue();

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long start = millis();
  int dots = 0;

  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - start > WIFI_TIMEOUT) {
      Serial.println("[WiFi] Timeout !");
      lcdShow("WiFi ERREUR", "Verif config.h");
      ledRed();
      buzzerError();
      return false;
    }
    delay(500);
    Serial.print(".");
    // Animer LCD
    lcd.setCursor(dots % 16, 1);
    lcd.print(".");
    dots++;
  }

  Serial.println("\n[WiFi] Connecté !");
  Serial.print("[WiFi] IP: ");
  Serial.println(WiFi.localIP());
  lcdShow("WiFi OK", WiFi.localIP().toString());
  ledGreen();
  delay(1000);
  ledOff();
  return true;
}

// ── Vérifier et reconnecter si nécessaire ────────────────────
bool wifiCheck() {
  if (WiFi.status() == WL_CONNECTED) return true;

  Serial.println("[WiFi] Connexion perdue, reconnexion...");
  lcdShow("WiFi perdu...", "Reconnexion");
  ledYellow();

  WiFi.disconnect();
  delay(1000);
  return wifiConnect();
}

// ── Statut WiFi ──────────────────────────────────────────────
String wifiStatus() {
  switch (WiFi.status()) {
    case WL_CONNECTED:       return "Connecte";
    case WL_DISCONNECTED:    return "Deconnecte";
    case WL_CONNECT_FAILED:  return "Echec";
    case WL_NO_SSID_AVAIL:   return "SSID inconnu";
    default:                 return "Inconnu";
  }
}

int wifiRSSI() {
  return WiFi.RSSI();
}

#endif
