// src/stores/deviceStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { onSnapshot, query, orderBy, updateDoc } from 'firebase/firestore'
import { devicesCol, deviceDoc } from '@/firebase/collections'

export const useDeviceStore = defineStore('devices', () => {
  const devices   = ref([])
  const loading   = ref(false)
  let unsubscribe = null

  const onlineDevices  = computed(() => devices.value.filter(d => d.status === 'online'))
  const offlineDevices = computed(() => devices.value.filter(d => d.status === 'offline'))
  const totalScans     = computed(() => devices.value.reduce((sum, d) => sum + (d.totalScans || 0), 0))

  // ── Real-time listener ─────────────────────────────────────
  function listenDevices() {
    if (unsubscribe) unsubscribe()
    unsubscribe = onSnapshot(
      query(devicesCol(), orderBy('room')),
      (snap) => {
        devices.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      }
    )
    return unsubscribe
  }

  // ── Update device config ───────────────────────────────────
  async function updateDevice(id, data) {
    await updateDoc(deviceDoc(id), data)
  }

  function stopListening() {
    if (unsubscribe) { unsubscribe(); unsubscribe = null }
  }

  return { devices, loading, onlineDevices, offlineDevices, totalScans, listenDevices, updateDevice, stopListening }
})
