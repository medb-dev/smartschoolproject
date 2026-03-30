// src/firebase/collections.js
// Centralise toutes les références Firestore

import { collection, doc } from 'firebase/firestore'
import { db } from './config'

// ── Collections racines ──────────────────────────────────────────
export const usersCol      = () => collection(db, 'users')
export const studentsCol   = () => collection(db, 'students')
export const coursesCol    = () => collection(db, 'courses')
export const badgesCol     = () => collection(db, 'badges')
export const devicesCol    = () => collection(db, 'devices')

// ── Sous-collections ─────────────────────────────────────────────
export const sessionsCol   = (courseId)  => collection(db, `courses/${courseId}/sessions`)
export const attendancesCol = (courseId, sessionId) =>
  collection(db, `courses/${courseId}/sessions/${sessionId}/attendances`)
export const paymentsCol   = (studentId) => collection(db, `students/${studentId}/payments`)

// ── Références document ──────────────────────────────────────────
export const studentDoc    = (id) => doc(db, 'students', id)
export const badgeDoc      = (uid) => doc(db, 'badges', uid)
export const deviceDoc     = (id) => doc(db, 'devices', id)
export const userDoc       = (id) => doc(db, 'users', id)
