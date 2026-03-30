# SmartSoutien — Firmware ESP32 NFC
Système de contrôle de présence par badge NFC pour école de soutien scolaire.

---

## 🛠️ Matériel requis

| Composant | Quantité | Prix estimé |
|---|---|---|
| ESP32 DevKit v1 | 1 | ~60 MAD |
| MFRC522 (lecteur NFC) | 1 | ~25 MAD |
| LCD I2C 16x2 | 1 | ~30 MAD |
| Buzzer actif 5V | 1 | ~5 MAD |
| LED RGB cathode commune | 1 | ~3 MAD |
| Résistances 220Ω | 3 | ~1 MAD |
| Breadboard + fils | 1 | ~20 MAD |
| Badges NFC MIFARE 1K | N | ~5 MAD/pièce |

---

## 🔌 Schéma de câblage

```
ESP32          MFRC522
─────────────────────────
GPIO 5  ───→  SDA (SS)
GPIO 18 ───→  SCK
GPIO 23 ───→  MOSI
GPIO 19 ←───  MISO
GPIO 27 ───→  RST
3.3V    ───→  3.3V    ⚠️ NE PAS utiliser 5V !
GND     ───→  GND

ESP32          LCD I2C 16x2
─────────────────────────
GPIO 21 ───→  SDA
GPIO 22 ───→  SCL
5V      ───→  VCC
GND     ───→  GND

ESP32          Buzzer actif
─────────────────────────
GPIO 26 ───→  + (via 100Ω)
GND     ───→  -

ESP32          LED RGB (cathode commune)
─────────────────────────
GPIO 25 ───→  R (via 220Ω)
GPIO 33 ───→  G (via 220Ω)
GPIO 32 ───→  B (via 220Ω)
GND     ───→  Cathode commune (-)
```

---

## 💻 Installation Arduino IDE

### Étape 1 — Ajouter le board ESP32

1. Arduino IDE → **File → Preferences**
2. Dans "Additional Boards Manager URLs", ajouter :
```
https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
```
3. **Tools → Board → Boards Manager** → chercher "esp32" → Installer

### Étape 2 — Sélectionner le board

**Tools → Board → ESP32 Arduino → ESP32 Dev Module**

Réglages recommandés :
- Upload Speed: **115200**
- CPU Frequency: **240MHz**
- Flash Size: **4MB**
- Partition Scheme: **Default 4MB**

### Étape 3 — Installer les bibliothèques

**Tools → Manage Libraries** → Chercher et installer :

| Bibliothèque | Auteur | Version |
|---|---|---|
| MFRC522 | GithubCommunity | 1.4.10+ |
| LiquidCrystal I2C | Frank de Brabander | 1.1.2+ |
| ArduinoJson | Benoit Blanchon | 6.21.0+ |

### Étape 4 — Configurer le projet

Ouvrir **`config.h`** et modifier :

```cpp
// WiFi
#define WIFI_SSID         "NOM_DE_VOTRE_WIFI"
#define WIFI_PASSWORD     "MOT_DE_PASSE_WIFI"

// Firebase (copier depuis Firebase Console → Project Settings)
#define FIREBASE_API_KEY      "AIzaSy..."
#define FIREBASE_PROJECT_ID   "smartsoutien"

// Compte Firebase dédié ESP32
// Créer dans : Authentication → Add user
#define FIREBASE_EMAIL        "esp32@smartsoutien.ma"
#define FIREBASE_PASSWORD     "Esp32Pass123!"

// Identité de CE dispositif (changer pour chaque salle)
#define DEVICE_ID       "ESP32-A"
#define DEVICE_ROOM     "Salle A"
```

### Étape 5 — Créer le compte ESP32 dans Firebase

1. Firebase Console → **Authentication → Users → Add user**
2. Email : `esp32@smartsoutien.ma`
3. Password : `Esp32Pass123!`

Ajouter dans Firestore **`users/{uid}`** :
```
role: "device"
deviceId: "ESP32-A"
```

### Étape 6 — Créer les règles Firestore pour l'ESP32

Dans **Firestore → Rules**, s'assurer que les devices peuvent écrire dans attendances :
```
match /courses/{c}/sessions/{s}/attendances/{a} {
  allow write: if request.auth.token.role == "device" || isAdmin();
}
match /devices/{d} {
  allow write: if request.auth != null;
}
```

### Étape 7 — Flasher le firmware

1. Brancher l'ESP32 via USB
2. Sélectionner le port : **Tools → Port → COM X** (Windows) ou **/dev/ttyUSB0** (Linux)
3. Cliquer **Upload** (→)
4. Ouvrir **Tools → Serial Monitor** (115200 bauds)
5. Vérifier les logs de démarrage

---

## 📋 Ajouter un badge NFC

Pour associer un badge à un étudiant, créer dans Firestore :

```
Collection : badges
Document ID : {UID_DU_BADGE}  (ex: A3:F2:84:0C)
  ├── studentId  (string) : {id_etudiant_firestore}
  ├── isActive   (bool)   : true
  └── createdAt  (string) : 2026-03-16
```

L'UID du badge s'affiche dans le **Serial Monitor** quand tu le scanne.

---

## 🔄 Flux complet

```
Badge scanné
    ↓
ESP32 lit l'UID (ex: A3:F2:84:0C)
    ↓
GET Firestore: badges/A3:F2:84:0C
    ↓
Badge valide ? ──Non──→ LCD "Accès refusé" + bip rouge
    ↓ Oui
GET Firestore: students/{studentId}
    ↓
Paiement OK ? ──Non──→ LCD "Paiement en attente" + LED jaune
    ↓ Oui
POST Firestore: courses/.../attendances/
    ↓
LCD "Bienvenue {nom}" + bip vert
    ↓
Dashboard Vue.js mis à jour en temps réel ✅
```

---

## 🚦 Signaux visuels / sonores

| Situation | LED | Buzzer | LCD |
|---|---|---|---|
| Démarrage | Bleu | 3 bips | "Demarrage..." |
| WiFi connexion | Bleu clignotant | — | "Connexion WiFi" |
| Système prêt | Vert 1s | 2 bips courts | "Systeme pret!" |
| Lecture badge | Bleu | — | "Verification..." |
| Accès autorisé | Vert | 2 bips courts | "Bienvenue {nom}" |
| Badge inconnu | Rouge | 3 bips courts | "Acces refuse" |
| Paiement attente | Jaune | 1 bip long | "Paiement en attente" |
| WiFi perdu | Jaune | — | "WiFi perdu..." |
| Mode hors-ligne | Jaune | 1 bip | "Mode hors-ligne" |

---

## 🗂️ Structure du projet

```
ESP32_SmartSoutien/
├── ESP32_SmartSoutien.ino  ← Sketch principal (ouvrir avec Arduino IDE)
├── config.h                ← ⚠️ Configuration (WiFi, Firebase, broches)
├── hardware.h              ← Fonctions LCD, buzzer, LED
├── firebase.h              ← Requêtes Firestore REST API
├── nfc.h                   ← Lecture badges MFRC522
├── wifi_manager.h          ← Connexion WiFi avec reconnexion auto
└── README.md               ← Ce fichier
```
