// ================================================================
//  firebase.h — Fonctions Firebase REST API
//  Utilise l'API REST Firestore (pas de lib Firebase nécessaire)
// ================================================================
#ifndef FIREBASE_H
#define FIREBASE_H

#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "config.h"

// Token d'authentification Firebase (renouvelé automatiquement)
extern String g_firebase_token;
extern unsigned long g_token_expiry;

// ── Obtenir un token Firebase (Email/Password Auth) ───────────
bool firebaseLogin() {
  HTTPClient http;
  String url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=";
  url += FIREBASE_API_KEY;

  String body = "{\"email\":\"" + String(FIREBASE_EMAIL) +
                "\",\"password\":\"" + String(FIREBASE_PASSWORD) +
                "\",\"returnSecureToken\":true}";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(body);

  if (code == 200) {
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, http.getString());
    g_firebase_token = doc["idToken"].as<String>();
    // Token valide 1 heure
    g_token_expiry = millis() + 3500000UL;
    http.end();
    Serial.println("[Firebase] Login OK");
    return true;
  }
  Serial.println("[Firebase] Login ERREUR: " + String(code));
  http.end();
  return false;
}

// ── Renouveler le token si expiré ────────────────────────────
void firebaseRefreshToken() {
  if (millis() > g_token_expiry) {
    Serial.println("[Firebase] Token expiré, renouvellement...");
    firebaseLogin();
  }
}

// ── GET Firestore document ────────────────────────────────────
String firestoreGet(String collection, String docId) {
  firebaseRefreshToken();

  HTTPClient http;
  String url = "https://firestore.googleapis.com/v1/projects/";
  url += FIREBASE_PROJECT_ID;
  url +=  "/databases/(default)/documents/"; //"/databases/smartsoutien/documents/";
  url += collection + "/" + docId;

  http.begin(url);
  http.addHeader("Authorization", "Bearer " + g_firebase_token);
  http.setTimeout(HTTP_TIMEOUT);

  int code = http.GET();
  String response = "";
  if (code == 200) {
    response = http.getString();
  } else {
    Serial.println("[Firestore GET] Erreur: " + String(code));
  }
  http.end();
  return response;
}

// ── POST (créer document) Firestore ──────────────────────────
bool firestorePost(String collection, String jsonBody) {
  firebaseRefreshToken();

  HTTPClient http;
  String url = "https://firestore.googleapis.com/v1/projects/";
  url += FIREBASE_PROJECT_ID;
  url += "/databases/(default)/documents/"; //"/databases/smartsoutien/documents/";
  //Correction
  url += collection;

  http.begin(url);
  http.addHeader("Authorization", "Bearer " + g_firebase_token);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(HTTP_TIMEOUT);

  int code = http.POST(jsonBody);
  bool ok  = (code == 200 || code == 201);
  if (!ok) {
    Serial.println("[Firestore POST] Erreur: " + String(code));
    Serial.println(http.getString());
  }
  http.end();
  return ok;
}

// ── PATCH (mettre à jour document) Firestore ─────────────────
bool firestorePatch(String collection, String docId, String jsonBody, String updateMask = "") {
  firebaseRefreshToken();

  HTTPClient http;
  String url = "https://firestore.googleapis.com/v1/projects/";
  url += FIREBASE_PROJECT_ID;
  url +=  "/databases/(default)/documents/"; //"/databases/smartsoutien/documents/";
  url += collection + "/" + docId;
  if (updateMask != "") url += "?updateMask.fieldPaths=" + updateMask;
  
  http.begin(url);
  http.addHeader("Authorization", "Bearer " + g_firebase_token);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(HTTP_TIMEOUT);

  int code = http.PATCH(jsonBody);
  bool ok  = (code == 200);
  if (!ok) Serial.println("[Firestore PATCH] Erreur: " + String(code));
  http.end();
  return ok;
}

// ── Construire un body Firestore (champs string) ──────────────
String firestoreBuildDoc(String fields) {
  // fields = "\"key\":{\"stringValue\":\"val\"},...  "
  return "{\"fields\":{" + fields + "}}";
}

String fsStr(String key, String value) {
  return "\"" + key + "\":{\"stringValue\":\"" + value + "\"}";
}
String fsInt(String key, int value) {
  return "\"" + key + "\":{\"integerValue\":\"" + String(value) + "\"}";
}
String fsBool(String key, bool value) {
  return "\"" + key + "\":{\"booleanValue\":" + (value ? "true" : "false") + "}";
}
String fsTimestamp(String key) {
  // Utilise la valeur serveur (plus précis que l'heure locale)
  return "\"" + key + "\":{\"timestampValue\":\"" + String(millis()) + "\"}";
}

#endif
