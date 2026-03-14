// src/composables/useFirestore.js
// Composable générique pour les requêtes Firestore réactives

import { ref, onUnmounted } from 'vue'
import {
  onSnapshot, query, orderBy, where,
  getDocs, addDoc, updateDoc, deleteDoc,
  serverTimestamp
} from 'firebase/firestore'

/**
 * useCollection — écoute une collection en temps réel
 * @param {CollectionReference} colRef - référence Firestore
 * @param {Array} constraints - filtres/orderBy optionnels
 */
export function useCollection(colRef, constraints = []) {
  const data    = ref([])
  const loading = ref(true)
  const error   = ref(null)

  const q = constraints.length ? query(colRef, ...constraints) : colRef

  const unsubscribe = onSnapshot(
    q,
    (snap) => {
      data.value    = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      loading.value = false
    },
    (err) => {
      error.value   = err.message
      loading.value = false
    }
  )

  onUnmounted(unsubscribe)

  return { data, loading, error }
}

/**
 * useDocument — écoute un document unique en temps réel
 * @param {DocumentReference} docRef
 */
export function useDocument(docRef) {
  const data    = ref(null)
  const loading = ref(true)
  const error   = ref(null)

  const unsubscribe = onSnapshot(
    docRef,
    (snap) => {
      data.value    = snap.exists() ? { id: snap.id, ...snap.data() } : null
      loading.value = false
    },
    (err) => {
      error.value   = err.message
      loading.value = false
    }
  )

  onUnmounted(unsubscribe)

  return { data, loading, error }
}

/**
 * useCrud — opérations CRUD génériques
 * @param {Function} colFn - fonction retournant CollectionReference
 */
export function useCrud(colFn) {
  const loading = ref(false)
  const error   = ref(null)

  async function add(data) {
    loading.value = true
    try {
      return await addDoc(colFn(), { ...data, createdAt: serverTimestamp() })
    } catch (e) {
      error.value = e.message; throw e
    } finally {
      loading.value = false
    }
  }

  async function update(docRef, data) {
    loading.value = true
    try {
      await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
    } catch (e) {
      error.value = e.message; throw e
    } finally {
      loading.value = false
    }
  }

  async function remove(docRef) {
    loading.value = true
    try {
      await deleteDoc(docRef)
    } catch (e) {
      error.value = e.message; throw e
    } finally {
      loading.value = false
    }
  }

  return { loading, error, add, update, remove }
}
