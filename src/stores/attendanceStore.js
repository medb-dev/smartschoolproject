// src/stores/attendanceStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
  collectionGroup,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import {
  attendancesCol,
  sessionsCol,
  studentsCol,
} from "@/firebase/collections";
import { collection } from "firebase/firestore";

export const useAttendanceStore = defineStore("attendance", () => {
  // ── State ──────────────────────────────────────────────────
  const todayAttendances = ref([]);
  const recentScans = ref([]);
  const loading = ref(false);
  const isLive = ref(false);
  let unsubscribe = null;

  // ── Getters ────────────────────────────────────────────────
  const presentCount = computed(
    () => todayAttendances.value.filter((a) => a.status === "present").length
  );
  const lateCount = computed(
    () => todayAttendances.value.filter((a) => a.status === "late").length
  );
  const absentCount = computed(
    () => todayAttendances.value.filter((a) => a.status === "absent").length
  );
  const presenceRate = computed(() => {
    const total = todayAttendances.value.length;
    if (!total) return 0;
    return Math.round((presentCount.value / total) * 100);
  });

  // ── Real-time listener sur une session précise ─────────────
  function listenSession(courseId, sessionId) {
    stopListening();
    loading.value = true;
    isLive.value = false;

    unsubscribe = onSnapshot(
      query(attendancesCol(courseId, sessionId), orderBy("scannedAt", "desc")),
      async (snap) => {
        loading.value = false;
        isLive.value = true;

        for (const change of snap.docChanges()) {
          const data = { id: change.doc.id, ...change.doc.data() };

          if (change.type === "added") {
            // Enrichir avec le nom de l'étudiant
            const enriched = await enrichAttendance(data);
            todayAttendances.value.unshift(enriched);
            recentScans.value.unshift(enriched);
            if (recentScans.value.length > 30) recentScans.value.pop();
          }
          if (change.type === "modified") {
            const idx = todayAttendances.value.findIndex(
              (a) => a.id === change.doc.id
            );
            if (idx !== -1)
              todayAttendances.value[idx] = await enrichAttendance(data);
          }
          if (change.type === "removed") {
            todayAttendances.value = todayAttendances.value.filter(
              (a) => a.id !== change.doc.id
            );
          }
        }
      },
      (err) => {
        console.warn("Attendance listener error:", err.message);
        loading.value = false;
        isLive.value = false;
      }
    );
    return unsubscribe;
  }

  // ── Listener global collectionGroup (toutes les sessions) ──
  function listenAllToday() {
    stopListening();
    isLive.value = false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    unsubscribe = onSnapshot(
      query(
        collectionGroup(db, "attendances"),
        where("scannedAt", ">=", today),
        orderBy("scannedAt", "desc")
      ),
      async (snap) => {
        isLive.value = true;
        for (const change of snap.docChanges()) {
          const data = { id: change.doc.id, ...change.doc.data() };
          if (change.type === "added") {
            const enriched = await enrichAttendance(data);
            todayAttendances.value.unshift(enriched);
            recentScans.value.unshift(enriched);
            if (recentScans.value.length > 30) recentScans.value.pop();
          }
        }
      },
      (err) => {
        console.warn("Global attendance listener error:", err.message);
        isLive.value = false;
      }
    );
    return unsubscribe;
  }

  // ── Enrichir une présence avec les données étudiant ────────
  async function enrichAttendance(data) {
    if (data.studentName) return data;
    if (!data.studentId) return data;
    try {
      const snap = await getDoc(doc(db, "students", data.studentId));
      if (snap.exists()) {
        const s = snap.data();
        return {
          ...data,
          studentName: s.name,
          course: s.filiere || "",
          initials: s.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2),
          color: colorForFiliere(s.filiere),
        };
      }
    } catch {}
    return data;
  }

  function colorForFiliere(f) {
    return { Math: "green", PC: "blue", SVT: "amber" }[f] || "green";
  }

  // ── Marquer une présence manuellement ─────────────────────
  async function markAttendance(
    courseId,
    sessionId,
    studentId,
    status = "present"
  ) {
    await addDoc(attendancesCol(courseId, sessionId), {
      studentId,
      status,
      scannedAt: serverTimestamp(),
      source: "manual",
    });
  }

  function stopListening() {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    isLive.value = false;
    todayAttendances.value = [];
    recentScans.value = [];
  }

  return {
    todayAttendances,
    recentScans,
    loading,
    isLive,
    presentCount,
    lateCount,
    absentCount,
    presenceRate,
    listenSession,
    listenAllToday,
    markAttendance,
    stopListening,
  };
});
