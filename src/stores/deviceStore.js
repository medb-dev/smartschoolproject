// src/stores/deviceStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { devicesCol, deviceDoc } from "@/firebase/collections";

export const useDeviceStore = defineStore("devices", () => {
  // ── State ──────────────────────────────────────────────────
  const devices = ref([]);
  const loading = ref(false);
  const isLive = ref(false);
  let unsubscribe = null;

  // ── Getters ────────────────────────────────────────────────
  const onlineDevices = computed(() =>
    devices.value.filter((d) => d.status === "online")
  );
  const offlineDevices = computed(() =>
    devices.value.filter((d) => d.status === "offline")
  );
  const totalScans = computed(() =>
    devices.value.reduce((sum, d) => sum + (d.totalScans || 0), 0)
  );
  const allOnline = computed(
    () => devices.value.length > 0 && offlineDevices.value.length === 0
  );

  // ── Real-time listener ─────────────────────────────────────
  function listenDevices() {
    stopListening();
    loading.value = true;
    isLive.value = false;

    unsubscribe = onSnapshot(
      query(devicesCol(), orderBy("room")),
      (snap) => {
        loading.value = false;
        isLive.value = true;

        snap.docChanges().forEach((change) => {
          const data = { id: change.doc.id, ...change.doc.data() };

          if (change.type === "added") {
            devices.value.push(data);
          }
          if (change.type === "modified") {
            const idx = devices.value.findIndex((d) => d.id === change.doc.id);
            if (idx !== -1) devices.value[idx] = data;
            else devices.value.push(data);
          }
          if (change.type === "removed") {
            devices.value = devices.value.filter((d) => d.id !== change.doc.id);
          }
        });

        // Sort: online first
        devices.value.sort((a, b) => {
          if (a.status === "online" && b.status !== "online") return -1;
          if (a.status !== "online" && b.status === "online") return 1;
          return 0;
        });
      },
      (err) => {
        console.warn("Device listener error:", err.message);
        loading.value = false;
        isLive.value = false;
      }
    );
    return unsubscribe;
  }

  // ── Update device config ───────────────────────────────────
  async function updateDevice(id, data) {
    await updateDoc(deviceDoc(id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  // ── Mark device online/offline manually ───────────────────
  async function setDeviceStatus(id, status) {
    await updateDoc(deviceDoc(id), {
      status,
      lastSeen: serverTimestamp(),
    });
  }

  function stopListening() {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    isLive.value = false;
    devices.value = [];
  }

  return {
    devices,
    loading,
    isLive,
    onlineDevices,
    offlineDevices,
    totalScans,
    allOnline,
    listenDevices,
    updateDevice,
    setDeviceStatus,
    stopListening,
  };
});
