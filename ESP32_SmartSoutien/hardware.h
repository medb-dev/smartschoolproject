// ================================================================
//  hardware.h — Fonctions LCD, Buzzer, LED RGB
// ================================================================
#ifndef HARDWARE_H
#define HARDWARE_H

#include <LiquidCrystal_I2C.h>
#include "config.h"

extern LiquidCrystal_I2C lcd;

// ── LCD ──────────────────────────────────────────────────────
void lcdClear() {
  lcd.clear();
}

void lcdShow(String line1, String line2 = "") {
  lcd.clear();
  lcd.setCursor(0, 0);
  // Tronquer si trop long
  if (line1.length() > 16) line1 = line1.substring(0, 16);
  lcd.print(line1);
  if (line2 != "") {
    lcd.setCursor(0, 1);
    if (line2.length() > 16) line2 = line2.substring(0, 16);
    lcd.print(line2);
  }
}

void lcdShowScroll(String name) {
  // Défilement si nom > 16 chars
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Bienvenue:");
  if (name.length() <= 16) {
    lcd.setCursor(0, 1);
    lcd.print(name);
  } else {
    // Afficher les 16 premiers chars
    lcd.setCursor(0, 1);
    lcd.print(name.substring(0, 16));
    delay(1000);
    // Puis faire défiler
    for (int i = 1; i <= (int)name.length() - 16; i++) {
      lcd.setCursor(0, 1);
      lcd.print(name.substring(i, i + 16));
      delay(200);
    }
  }
}

// ── LED RGB ──────────────────────────────────────────────────
// Cathode commune : HIGH = éteint, LOW = allumé (inversé)
// Anode commune   : LOW = éteint, HIGH = allumé
// → Adapter selon votre câblage (décommenter la bonne version)

void setLED(bool r, bool g, bool b) {
  // Cathode commune (la plus courante)
  digitalWrite(PIN_LED_RED,   r ? LOW : HIGH);
  digitalWrite(PIN_LED_GREEN, g ? LOW : HIGH);
  digitalWrite(PIN_LED_BLUE,  b ? LOW : HIGH);

  // Anode commune (décommenter si besoin)
  // digitalWrite(PIN_LED_RED,   r ? HIGH : LOW);
  // digitalWrite(PIN_LED_GREEN, g ? HIGH : LOW);
  // digitalWrite(PIN_LED_BLUE,  b ? HIGH : LOW);
}

void ledOff()    { setLED(false, false, false); }
void ledRed()    { setLED(true,  false, false); }
void ledGreen()  { setLED(false, true,  false); }
void ledBlue()   { setLED(false, false, true);  }
void ledYellow() { setLED(true,  true,  false); }
void ledWhite()  { setLED(true,  true,  true);  }

// Clignotement
void ledBlink(void(*colorFn)(), int times = 2, int delayMs = 150) {
  for (int i = 0; i < times; i++) {
    colorFn();
    delay(delayMs);
    ledOff();
    delay(delayMs);
  }
}

// ── Buzzer ───────────────────────────────────────────────────
void buzz(int durationMs, int freq = 1000) {
  // Buzzer actif (pas besoin de fréquence)
  digitalWrite(PIN_BUZZER, HIGH);
  delay(durationMs);
  digitalWrite(PIN_BUZZER, LOW);
}

void buzzerOK() {
  // Deux bips courts = accès autorisé
  buzz(BUZZ_OK_MS);
  delay(80);
  buzz(BUZZ_OK_MS);
}

void buzzerError() {
  // Un long bip = refusé / erreur
  buzz(BUZZ_ERR_MS);
}

void buzzerDeny() {
  // Trois bips courts = badge inconnu
  for (int i = 0; i < 3; i++) {
    buzz(100);
    delay(60);
  }
}

void buzzerStartup() {
  // Mélodie de démarrage
  buzz(100); delay(50);
  buzz(100); delay(50);
  buzz(200);
}

// ── Animations ───────────────────────────────────────────────
void animateScanning() {
  // Animation "lecture en cours" sur LCD
  static int dots = 0;
  lcd.setCursor(0, 1);
  lcd.print("Approchez badge");
  lcd.setCursor(15, 1);
  lcd.print(dots % 2 == 0 ? "." : " ");
  dots++;
}

void showWelcome(String name, bool allowed) {
  if (allowed) {
    ledGreen();
    buzzerOK();
    lcdShow("Bienvenue!", name.substring(0, 16));
  } else {
    ledRed();
    buzzerDeny();
    lcdShow("Acces refuse", "Badge inconnu");
  }
  delay(MSG_DISPLAY_TIME);
  ledOff();
}

void showPaymentWarning(String name) {
  ledYellow();
  buzzerError();
  lcdShow("Paiement en", "attente: " + name.substring(0, 7));
  delay(MSG_DISPLAY_TIME);
  ledOff();
}

void showAlreadyScanned(String name) {
  ledBlue();
  buzz(80);
  lcdShow("Deja enregistre", name.substring(0, 16));
  delay(1500);
  ledOff();
}

#endif
