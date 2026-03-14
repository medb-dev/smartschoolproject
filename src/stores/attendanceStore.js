// src/stores/attendanceStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  addDoc, updateDoc, getDocs, query,
  orderBy, where, onSnapshot, serverTimestamp, doc
} from 'firebase/firestore'
import { attendancesCol, sessionsCol, badgeDoc } from '@/firebase/collections'
import { db } from '@/firebase/config'

export const useAttendanceStore = defineStore('attendance', () => {
  // ── State ──────────────────────────────────────────────────
  const todayAttendances  = ref([])   // présences du jour (temps réel)
  const recentScans       = ref([])   // derniers scans NFC reçus
  const loading           = ref(false)
  let   unsubscribe       = null      // Firestore listener handle

  // ── Getters ────────────────────────────────────────────────
  const presentCount  = computed(() => todayAttendances.value.filter(a => a.status === 'present').length)
  const lateCount     = computed(() => todayAttendances.value.filter(a => a.status === 'late').length)
  const absentCount   = computed(() => todayAttendances.value.filter(a => a.status === 'absent').length)
  const presenceRate  = computed(() => {
    const total = todayAttendances.value.length
    if (!total) return 0
    return Math.round((presentCount.value / total) * 100)
  })

  // ── Real-time listener (Firestore → Dashboard live) ────────
  //    Appelé quand l'ESP32 enregistre un scan
  function listenSession(courseId, sessionId) {
    if (unsubscribe) unsubscribe()

    unsubscribe = onSnapshot(
      query(
        attendancesCol(courseId, sessionId),
        orderBy('scannedAt', 'desc')
      ),
      (snap) => {
        snap.docChanges().forEach(change => {
          if (change.type === 'added') {
            const data = { id: change.doc.id, ...change.doc.data() }
            // Ajouter en tête de liste (plus récent en premier)
            todayAttendances.value.unshift(data)
            recentScans.value.unshift(data)
            if (recentScans.value.length > 20) recentScans.value.pop()
          }
          if (change.type === 'modified') {
            const idx = todayAttendances.value.findIndex(a => a.id === change.doc.id)
            if (idx !== -1) {
              todayAttendances.value[idx] = { id: change.doc.id, ...change.doc.data() }
            }
          }
        })
      }
    )
    return unsubscribe
  }

  // ── Enregistrer manuellement une présence ──────────────────
  async function markAttendance(courseId, sessionId, studentId, status = 'present') {
    await addDoc(attendancesCol(courseId, sessionId), {
      studentId,
      status,
      scannedAt: serverTimestamp(),
      source: 'manual'
    })
  }

  // ── Traitement scan badge NFC (reçu de l'ESP32) ────────────
  //    L'ESP32 POST vers Cloud Function qui appelle cette logique
  async function processBadgeScan(badgeUID, deviceId) {
    // 1. Vérifier le badge
    const badgeSnap = await getDocs(
      query(badgesCol(), where('uid', '==', badgeUID), where('isActive', '==', true))
    )
    if (badgeSnap.empty) return { allowed: false, reason: 'badge_unknown' }

    const badge = badgeSnap.docs[0].data()
    const studentId = badge.studentId

    // 2. Trouver la session en cours pour ce dispositif
    // (la Cloud Function fournit courseId + sessionId selon l'heure)
    return { allowed: true, studentId }
  }

  // ── Fetch historique ───────────────────────────────────────
  async function fetchHistory(courseId, sessionId) {
    loading.value = true
    try {
      const q = query(attendancesCol(courseId, sessionId), orderBy('scannedAt', 'desc'))
      const snap = await getDocs(q)
      todayAttendances.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } finally {
      loading.value = false
    }
  }

  function stopListening() {
    if (unsubscribe) { unsubscribe(); unsubscribe = null }
    todayAttendances.value = []
  }

  return {
    todayAttendances, recentScans, loading,
    presentCount, lateCount, absentCount, presenceRate,
    listenSession, markAttendance, processBadgeScan, fetchHistory, stopListening
  }
})
