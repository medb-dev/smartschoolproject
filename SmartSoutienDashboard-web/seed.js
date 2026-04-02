// seed.js — Peupler Firestore avec des données de test
// Exécuter : node seed.js
//
// Installer d'abord : npm install firebase-admin

const admin = require("firebase-admin");

// ── Initialisation ───────────────────────────────────────────
// Télécharger la clé depuis : Firebase Console → Project Settings
// → Service Accounts → Generate new private key → sauvegarder en serviceAccountKey.json
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://smartsoutien-default-rtdb.europe-west1.firebasedatabase.app",
});

const db = admin.firestore();
db.settings({ databaseId: "smartschoolproject-db" });

// ── Données de test ──────────────────────────────────────────

const students = [
  {
    id: "student_001",
    name: "Yassine Benali",
    email: "y.benali@mail.ma",
    filiere: "Math",
    badgeUID: "90:CB:75:F2",
    paymentStatus: "paid",
    presenceRate: 92,
    isActive: true,
    parentPhone: "+212 6 12 34 56 78",
  },
  {
    id: "student_002",
    name: "Sara Wahbi",
    email: "s.wahbi@mail.ma",
    filiere: "PC",
    badgeUID: "43:E9:5F:35",
    paymentStatus: "paid",
    presenceRate: 88,
    isActive: true,
    parentPhone: "+212 6 23 45 67 89",
  },
  {
    id: "student_003",
    name: "Karim Ouali",
    email: "k.ouali@mail.ma",
    filiere: "SVT",
    badgeUID: "3A:8E:18:C3",
    paymentStatus: "pending",
    presenceRate: 71,
    isActive: true,
    parentPhone: "+212 6 34 56 78 90",
  },
  {
    id: "student_004",
    name: "Nadia El Fassi",
    email: "n.elfassi@mail.ma",
    filiere: "Math",
    badgeUID: "NFC-055B",
    paymentStatus: "paid",
    presenceRate: 95,
    isActive: true,
    parentPhone: "+212 6 45 67 89 01",
  },
  {
    id: "student_005",
    name: "Amine Mounir",
    email: "a.mounir@mail.ma",
    filiere: "PC",
    badgeUID: "NFC-078D",
    paymentStatus: "overdue",
    presenceRate: 65,
    isActive: true,
    parentPhone: "+212 6 56 78 90 12",
  },
  {
    id: "student_006",
    name: "Hafsa Zaim",
    email: "h.zaim@mail.ma",
    filiere: "Math",
    badgeUID: "NFC-092E",
    paymentStatus: "paid",
    presenceRate: 83,
    isActive: true,
    parentPhone: "+212 6 67 89 01 23",
  },
  {
    id: "student_007",
    name: "Mehdi Rachidi",
    email: "m.rachidi@mail.ma",
    filiere: "SVT",
    badgeUID: "NFC-047G",
    paymentStatus: "paid",
    presenceRate: 77,
    isActive: true,
    parentPhone: "+212 6 78 90 12 34",
  },
  {
    id: "student_008",
    name: "Zineb Alaoui",
    email: "z.alaoui@mail.ma",
    filiere: "PC",
    badgeUID: "NFC-066H",
    paymentStatus: "pending",
    presenceRate: 91,
    isActive: true,
    parentPhone: "+212 6 89 01 23 45",
  },
  {
    id: "student_009",
    name: "Omar Tazi",
    email: "o.tazi@mail.ma",
    filiere: "Math",
    badgeUID: "NFC-011I",
    paymentStatus: "paid",
    presenceRate: 86,
    isActive: true,
    parentPhone: "+212 6 90 12 34 56",
  },
  {
    id: "student_010",
    name: "Fatima Idrissi",
    email: "f.idrissi@mail.ma",
    filiere: "SVT",
    badgeUID: "NFC-033J",
    paymentStatus: "paid",
    presenceRate: 79,
    isActive: true,
    parentPhone: "+212 6 01 23 45 67",
  },
];

const badges = [
  { uid: "90:CB:75:F2", studentId: "student_001", isActive: true },
  { uid: "43:E9:5F:35", studentId: "student_002", isActive: true },
  { uid: "3A:8E:18:C3", studentId: "student_003", isActive: true },
];

const courses = [
  {
    id: "cours_math_A",
    subject: "Mathématiques",
    room: "Salle A",
    teacherId: "prof_001",
    schedule: "Lun/Mer/Ven 14h-16h",
    sessions: [
      {
        id: "session_001",
        date: "2026-03-24",
        startTime: "14:00",
        endTime: "16:00",
        isActive: false,
      },
      {
        id: "session_002",
        date: "2026-03-26",
        startTime: "14:00",
        endTime: "16:00",
        isActive: true,
      },
    ],
  },
  {
    id: "cours_pc_B",
    subject: "Physique-Chimie",
    room: "Salle B",
    teacherId: "prof_002",
    schedule: "Mar/Jeu 14h30-16h30",
    sessions: [
      {
        id: "session_001",
        date: "2026-03-25",
        startTime: "14:30",
        endTime: "16:30",
        isActive: true,
      },
    ],
  },
  {
    id: "cours_svt_C",
    subject: "SVT",
    room: "Salle C",
    teacherId: "prof_003",
    schedule: "Sam 10h-12h",
    sessions: [
      {
        id: "session_001",
        date: "2026-03-22",
        startTime: "10:00",
        endTime: "12:00",
        isActive: false,
      },
    ],
  },
];

const devices = [
  {
    id: "ESP32-A",
    room: "Salle A",
    subject: "Mathématiques",
    status: "online",
    totalScans: 247,
    firmware: "v2.1.0",
    ip: "192.168.1.20",
  },
  {
    id: "ESP32-B",
    room: "Salle B",
    subject: "Physique-Chimie",
    status: "online",
    totalScans: 189,
    firmware: "v2.1.0",
    ip: "192.168.1.21",
  },
  {
    id: "ESP32-C",
    room: "Salle C",
    subject: "SVT",
    status: "offline",
    totalScans: 0,
    firmware: "v2.0.3",
    ip: "—",
  },
];

const payments = {
  student_001: [
    {
      month: "Mars 2026",
      amount: 450,
      method: "CMI",
      status: "paid",
      date: "2026-03-01",
    },
    {
      month: "Février 2026",
      amount: 450,
      method: "CMI",
      status: "paid",
      date: "2026-02-01",
    },
    {
      month: "Janvier 2026",
      amount: 450,
      method: "Espèces",
      status: "paid",
      date: "2026-01-05",
    },
    {
      month: "Avril 2026",
      amount: 450,
      method: "—",
      status: "pending",
      date: null,
    },
  ],
  student_002: [
    {
      month: "Mars 2026",
      amount: 450,
      method: "CMI",
      status: "paid",
      date: "2026-03-02",
    },
    {
      month: "Février 2026",
      amount: 450,
      method: "Virement",
      status: "paid",
      date: "2026-02-03",
    },
  ],
  student_003: [
    {
      month: "Mars 2026",
      amount: 450,
      method: "—",
      status: "pending",
      date: null,
    },
    {
      month: "Février 2026",
      amount: 450,
      method: "Espèces",
      status: "paid",
      date: "2026-02-10",
    },
  ],
  student_005: [
    {
      month: "Mars 2026",
      amount: 450,
      method: "—",
      status: "overdue",
      date: null,
    },
    {
      month: "Février 2026",
      amount: 450,
      method: "—",
      status: "overdue",
      date: null,
    },
  ],
};

const attendances = [
  {
    studentId: "student_001",
    studentName: "Yassine Benali",
    badgeUID: "90:CB:75:F2",
    status: "present",
    deviceId: "ESP32-A",
    room: "Salle A",
    source: "nfc",
    courseId: "cours_math_A",
    sessionId: "session_002",
  },
  {
    studentId: "student_002",
    studentName: "Sara Wahbi",
    badgeUID: "43:E9:5F:35",
    status: "present",
    deviceId: "ESP32-B",
    room: "Salle B",
    source: "nfc",
    courseId: "cours_pc_B",
    sessionId: "session_001",
  },
  {
    studentId: "student_003",
    studentName: "Karim Ouali",
    badgeUID: "3A:8E:18:C3",
    status: "late",
    deviceId: "ESP32-A",
    room: "Salle A",
    source: "nfc",
    courseId: "cours_math_A",
    sessionId: "session_002",
  },
  {
    studentId: "student_004",
    studentName: "Nadia El Fassi",
    badgeUID: "NFC-055B",
    status: "present",
    deviceId: "ESP32-A",
    room: "Salle A",
    source: "nfc",
    courseId: "cours_math_A",
    sessionId: "session_002",
  },
];

// ── Seed functions ────────────────────────────────────────────

async function seedStudents() {
  console.log("📚 Seeding students...");
  for (const s of students) {
    const { id, ...data } = s;
    await db
      .collection("students")
      .doc(id)
      .set({
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Payments sous-collection
    if (payments[id]) {
      for (const p of payments[id]) {
        await db
          .collection("students")
          .doc(id)
          .collection("payments")
          .add({
            ...p,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
      }
    }
    console.log(`  ✅ ${s.name}`);
  }
}

async function seedBadges() {
  console.log("🏷️  Seeding badges...");
  for (const b of badges) {
    const { uid, ...data } = b;
    await db.collection("badges").doc(uid).set(data);
    console.log(`  ✅ ${uid}`);
  }
}

async function seedCourses() {
  console.log("📖 Seeding courses...");
  for (const c of courses) {
    const { id, sessions, ...data } = c;
    await db.collection("courses").doc(id).set(data);

    for (const s of sessions) {
      const { id: sid, ...sdata } = s;
      const sessionRef = db
        .collection("courses")
        .doc(id)
        .collection("sessions")
        .doc(sid);
      await sessionRef.set(sdata);

      // Attendances pour sessions actives
      const sessionAttendances = attendances.filter(
        (a) => a.courseId === id && a.sessionId === sid
      );
      for (const a of sessionAttendances) {
        const { courseId, sessionId, ...adata } = a;
        await sessionRef.collection("attendances").add({
          ...adata,
          scannedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
    console.log(`  ✅ ${c.subject} (${c.id})`);
  }
}

async function seedDevices() {
  console.log("📡 Seeding devices...");
  for (const d of devices) {
    const { id, ...data } = d;
    await db
      .collection("devices")
      .doc(id)
      .set({
        ...data,
        lastSeen: admin.firestore.FieldValue.serverTimestamp(),
      });
    console.log(`  ✅ ${id} — ${d.room}`);
  }
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log("\n🚀 SmartSoutien — Firestore Seed\n");
  try {
    await seedStudents();
    await seedBadges();
    await seedCourses();
    await seedDevices();
    console.log("\n✅ Seed terminé avec succès !");
    console.log("   10 étudiants · 3 badges · 3 cours · 3 dispositifs\n");
  } catch (err) {
    console.error("❌ Erreur:", err.message);
  }
  process.exit(0);
}

main();
