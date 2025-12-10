// src/stores/dataStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { db } from "../db";
// ⭐️ Importamos el store de conectividad
import { useConnectivityStore } from "./connectivityStore";
// import axios from 'axios'; // Tu cliente HTTP

export const useDataStore = defineStore("data", () => {
  const connectivityStore = useConnectivityStore();

  // ⭐️ Usamos una propiedad computada para obtener el estado online ⭐️
  const isOnline = computed(() => connectivityStore.isOnline);

  const registros = ref([]);
  const pendientesCount = ref(0);
  const API_URL = "https://tu-backend.com/api/registros";

  // --- 1. Observador de Conexión y Carga de Datos ---

  // Aquí ya no necesitas los window.addEventListener('online', ...)

  // Si Pinia es v2 o Vue 3.2+, puedes usar $subscribe o watch:
  connectivityStore.$subscribe((mutation, state) => {
    // Este código se ejecuta cada vez que 'isOnline' cambia en connectivityStore
    if (state.isOnline) {
      sincronizarPendientes();
    }
  });

  // --- 2. Agregar Nuevo Registro (Lógica Central) ---

  async function guardarRegistro(data) {
    const tempRecord = { ...data, id: Date.now() };

    // ⭐️ Usamos la propiedad computada 'isOnline'
    if (isOnline.value) {
      try {
        console.log("Online: Enviando a backend...");
        // Lógica de envío al backend y guardado en db.registros...
        // ...
      } catch (error) {
        console.warn("Backend falló. Guardando como pendiente.", error);
        await guardarPendiente(tempRecord);
      }
    } else {
      // 🔴 OFFLINE: Guarda como pendiente
      console.log("Offline: Guardando como pendiente...");
      await guardarPendiente(tempRecord);
    }
    await fetchRegistros();
  }

  // --- 3. Sincronización ---

  async function sincronizarPendientes() {
    // ⭐️ Usamos la propiedad computada 'isOnline'
    if (!isOnline.value || pendientesCount.value === 0) return;

    // ... lógica de sincronización...
  }

  // ... (el resto del store, como fetchRegistros y guardarPendiente) ...

  return {
    registros,
    pendientesCount,
    guardarRegistro,
    sincronizarPendientes,
  };
});
