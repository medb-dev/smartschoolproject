// src/stores/studentStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { studentsCol, studentDoc, paymentsCol } from "@/firebase/collections";

export const useStudentStore = defineStore("students", () => {
  // ── State ──────────────────────────────────────────────────
  const students = ref([]);
  const loading = ref(false);
  const isLive = ref(false);
  const selected = ref(null);
  let unsubscribe = null;

  // ── Getters ────────────────────────────────────────────────
  const totalStudents = computed(() => students.value.length);
  const activeStudents = computed(() =>
    students.value.filter((s) => s.isActive !== false)
  );
  const unpaidStudents = computed(() =>
    students.value.filter((s) => s.paymentStatus !== "paid")
  );
  const byFiliere = computed(
    () => (f) => students.value.filter((s) => s.filiere === f)
  );

  // ── Real-time listener ─────────────────────────────────────
  function listenStudents() {
    stopListening();
    loading.value = true;
    isLive.value = false;

    unsubscribe = onSnapshot(
      query(studentsCol(), orderBy("name")),
      (snap) => {
        loading.value = false;
        isLive.value = true;

        snap.docChanges().forEach((change) => {
          const data = { id: change.doc.id, ...change.doc.data() };
          if (change.type === "added") {
            students.value.push(data);
          }
          if (change.type === "modified") {
            const idx = students.value.findIndex((s) => s.id === change.doc.id);
            if (idx !== -1) students.value[idx] = data;
            else students.value.push(data);
          }
          if (change.type === "removed") {
            students.value = students.value.filter(
              (s) => s.id !== change.doc.id
            );
          }
        });
      },
      (err) => {
        console.warn("Student listener error:", err.message);
        loading.value = false;
        isLive.value = false;
      }
    );
    return unsubscribe;
  }

  // ── CRUD ───────────────────────────────────────────────────
  async function fetchStudent(id) {
    const snap = await getDoc(studentDoc(id));
    if (snap.exists()) selected.value = { id: snap.id, ...snap.data() };
    return selected.value;
  }

  async function createStudent(data) {
    const ref = await addDoc(studentsCol(), {
      ...data,
      isActive: true,
      paymentStatus: "pending",
      presenceRate: 0,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  }

  async function updateStudent(id, data) {
    await updateDoc(studentDoc(id), { ...data, updatedAt: serverTimestamp() });
  }

  async function deleteStudent(id) {
    await deleteDoc(studentDoc(id));
  }

  // ── Payments ───────────────────────────────────────────────
  async function fetchPayments(studentId) {
    const q = query(paymentsCol(studentId), orderBy("date", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async function addPayment(studentId, paymentData) {
    await addDoc(paymentsCol(studentId), {
      ...paymentData,
      date: serverTimestamp(),
    });
    await updateDoc(studentDoc(studentId), {
      paymentStatus: "paid",
      updatedAt: serverTimestamp(),
    });
  }

  function stopListening() {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    isLive.value = false;
    students.value = [];
  }

  return {
    students,
    loading,
    isLive,
    selected,
    totalStudents,
    activeStudents,
    unpaidStudents,
    byFiliere,
    listenStudents,
    fetchStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    fetchPayments,
    addPayment,
    stopListening,
  };
});
