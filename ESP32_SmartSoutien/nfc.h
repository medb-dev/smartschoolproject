// ================================================================
//  nfc.h — Lecture badges NFC/RFID (MFRC522)
// ================================================================
#ifndef NFC_H
#define NFC_H

#include <MFRC522.h>
#include "config.h"

extern MFRC522 nfc;

// ── Lire l'UID d'un badge ────────────────────────────────────
// Retourne "" si pas de badge présent
String readUID() {
  // Vérifier si un badge est présent
  if (!nfc.PICC_IsNewCardPresent()) return "";
  if (!nfc.PICC_ReadCardSerial())   return "";

  // Construire l'UID en hex
  String uid = "";
  for (byte i = 0; i < nfc.uid.size; i++) {
    if (nfc.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(nfc.uid.uidByte[i], HEX);
    if (i < nfc.uid.size - 1) uid += ":";
  }
  uid.toUpperCase();

  // Arrêter la communication avec le badge
  nfc.PICC_HaltA();
  nfc.PCD_StopCrypto1();

  return uid;
}

// ── Vérifier si c'est un double scan récent ──────────────────
bool isDoubleScan(String uid, String &lastUID, unsigned long &lastTime) {
  unsigned long now = millis();
  if (uid == lastUID && (now - lastTime) < SCAN_COOLDOWN) {
    return true;
  }
  lastUID  = uid;
  lastTime = now;
  return false;
}

// ── Afficher infos NFC dans Serial Monitor ───────────────────
void printCardInfo() {
  Serial.print("[NFC] Type: ");
  MFRC522::PICC_Type piccType = nfc.PICC_GetType(nfc.uid.sak);
  Serial.println(nfc.PICC_GetTypeName(piccType));
  Serial.print("[NFC] UID: ");
  for (byte i = 0; i < nfc.uid.size; i++) {
    if (nfc.uid.uidByte[i] < 0x10) Serial.print("0");
    Serial.print(nfc.uid.uidByte[i], HEX);
    if (i < nfc.uid.size - 1) Serial.print(":");
  }
  Serial.println();
}

// ── Test de l'antenne NFC ────────────────────────────────────
bool testNFC() {
  byte v = nfc.PCD_ReadRegister(nfc.VersionReg);
  if (v == 0x00 || v == 0xFF) {
    Serial.println("[NFC] ERREUR: Module non détecté !");
    return false;
  }
  Serial.print("[NFC] Version firmware: 0x");
  Serial.println(v, HEX);
  return true;
}

#endif
