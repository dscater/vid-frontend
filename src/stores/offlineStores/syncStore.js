// src/stores/offlineStores/syncStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { db } from "../../db.js";
// TOAST
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import api from "../../composables/axios.js";
export const useSyncStore = defineStore("sync", () => {
  const isSyncing = ref(false);
  const lastSync = ref(null);
  const syncErrors = ref([]);

  // Mapeo de tablas de Dexie a endpoints del backend y su lógica de 'sync'
  const API_URL = import.meta.env.VITE_API_URL;
  const syncMap = {
    // Tablas que manejan sincronización (se inyecta sync: true)
    orden_ventas: {
      api: API_URL + "/admin/orden_ventas/listado",
      hasSyncField: true,
    },
    proformas: {
      api: API_URL + "/admin/proformas/listado",
      hasSyncField: true,
    },
    cuenta_cobrars: {
      api: API_URL + "/admin/cuenta_cobrars/listado",
      hasSyncField: true,
    },
    clientes: { api: API_URL + "/admin/clientes/listado", hasSyncField: true },
    devolucion_clientes: {
      api: API_URL + "/admin/devolucion_clientes/listado",
      hasSyncField: true,
    },
    // Tablas que son solo lectura/catálogos (no necesitan el campo sync)
    productos: {
      api: API_URL + "/admin/productos/listado",
      hasSyncField: false,
    },
    sucursals: {
      api: API_URL + "/admin/sucursals/listado",
      hasSyncField: false,
    },
    sucursal_productos: {
      api: API_URL + "/admin/sucursal_productos/listadoSucursales",
      hasSyncField: false,
    },
    unidad_medidas: {
      api: API_URL + "/admin/unidad_medidas/listado",
      hasSyncField: false,
    },
  };

  /**
   * Realiza la sincronización inicial: descarga todos los datos del backend
   * y los guarda masivamente en IndexedDB.
   */
  async function initialSyncAndCache() {
    if (isSyncing.value) return;

    isSyncing.value = true;
    syncErrors.value = [];
    let successCount = 0;

    // Itera sobre el mapa de sincronización
    for (const [tableName, config] of Object.entries(syncMap)) {
      try {
        // 1. Obtener datos del Backend
        const respuesta = await api.get(config.api);
        const rawData = respuesta.data;
        // 2. Inyectar campo 'sync' (si aplica)
        let dataToStore = rawData[tableName];
        if (config.hasSyncField) {
          // ⭐️ CLAVE: Inyectamos sync: 1 (o true) para indicar que viene del backend
          dataToStore = rawData[tableName].map((record) => ({
            ...record,
            sync: Boolean(true), // Datos descargados están sincronizados por defecto
          }));
        }

        // 3. Almacenamiento masivo en Dexie
        // bulkPut: Inserta o actualiza masivamente. Es mucho más rápido que .add() en un loop.
        await db[tableName].bulkPut(dataToStore);
        console.log(`✅ ${tableName} guardados: ${dataToStore.length}`);
        successCount++;
        toast.success(`Sincronización correcta de ${tableName}`);
      } catch (error) {
        console.error(`Error al sincronizar ${tableName}:`, error);
        syncErrors.value.push(`Fallo al sincronizar ${tableName}.`);
        toast.error(`Error al sincronizar ${tableName}`);
      }
    }

    if (successCount === Object.keys(syncMap).length) {
      lastSync.value = new Date().toLocaleString();
      console.log("Sincronización inicial completada con éxito.");
      toast.success(`Sincronización inicial completada con éxito`);
    }
    isSyncing.value = false;
  }

  return {
    isSyncing,
    lastSync,
    syncErrors,
    initialSyncAndCache,
  };
});
