// src/stores/studentStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp, onSnapshot
} from 'firebase/firestore'
import { studentsCol, studentDoc, paymentsCol } from '@/firebase/collections'

export const useStudentStore = defineStore('students', () => {
  // ── State ──────────────────────────────────────────────────
  const students  = ref([])
  const loading   = ref(false)
  const selected  = ref(null)

  // ── Getters ────────────────────────────────────────────────
  const totalStudents   = computed(() => students.value.length)
  const activeStudents  = computed(() => students.value.filter(s => s.isActive))
  const byFiliere       = computed(() => (f) => students.value.filter(s => s.filiere === f))
  const unpaidStudents  = computed(() => students.value.filter(s => s.paymentStatus !== 'paid'))

  // ── Fetch all students ─────────────────────────────────────
  async function fetchStudents() {
    loading.value = true
    try {
      const q = query(studentsCol(), orderBy('name'))
      const snap = await getDocs(q)
      students.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } finally {
      loading.value = false
    }
  }

  // ── Real-time listener ─────────────────────────────────────
  function listenStudents() {
    return onSnapshot(
      query(studentsCol(), orderBy('name')),
      (snap) => {
        students.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      }
    )
  }

  // ── Fetch single student ───────────────────────────────────
  async function fetchStudent(id) {
    const snap = await getDoc(studentDoc(id))
    if (snap.exists()) {
      selected.value = { id: snap.id, ...snap.data() }
    }
    return selected.value
  }

  // ── Create student ─────────────────────────────────────────
  async function createStudent(data) {
    const doc = await addDoc(studentsCol(), {
      ...data,
      isActive: true,
      createdAt: serverTimestamp(),
      paymentStatus: 'pending'
    })
    return doc.id
  }

  // ── Update student ─────────────────────────────────────────
  async function updateStudent(id, data) {
    await updateDoc(studentDoc(id), {
      ...data,
      updatedAt: serverTimestamp()
    })
    // Refresh local list
    const idx = students.value.findIndex(s => s.id === id)
    if (idx !== -1) students.value[idx] = { ...students.value[idx], ...data }
  }

  // ── Delete student ─────────────────────────────────────────
  async function deleteStudent(id) {
    await deleteDoc(studentDoc(id))
    students.value = students.value.filter(s => s.id !== id)
  }

  // ── Fetch payments for a student ───────────────────────────
  async function fetchPayments(studentId) {
    const q = query(paymentsCol(studentId), orderBy('date', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  }

  // ── Add payment ────────────────────────────────────────────
  async function addPayment(studentId, paymentData) {
    await addDoc(paymentsCol(studentId), {
      ...paymentData,
      date: serverTimestamp()
    })
    await updateDoc(studentDoc(studentId), { paymentStatus: 'paid' })
  }

  return {
    students, loading, selected,
    totalStudents, activeStudents, byFiliere, unpaidStudents,
    fetchStudents, listenStudents, fetchStudent,
    createStudent, updateStudent, deleteStudent,
    fetchPayments, addPayment
  }
})
