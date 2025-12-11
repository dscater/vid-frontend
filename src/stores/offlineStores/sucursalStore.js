// src/stores/dataStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { db } from "../../db.js";
import { useConnectivityStore } from "./useConnectivityStore.js";

export const useSucursalStore = defineStore("sucursalStore", () => {
  const connectivityStore = useConnectivityStore();
  const isOnline = computed(() => connectivityStore.isOnline);
  const registros = ref([]);
  const pendientesCount = ref(0);

  //   GET REGISTROS
  const getAll = async () => {
    try {
      registros.value = await db.sucursals.toArray();
      return registros.value;
    } catch (error) {
      console.error("Error al obtener todas los registros:", error);
      return [];
    }
  };
  const getAllSinAlmacen = async () => {
    try {
      registros.value = await db.sucursals.where("almacen").equals(0).toArray();
      return registros.value;
    } catch (error) {
      console.error("Error al obtener todas los registros:", error);
      return [];
    }
  };

  async function getSucursalById(id) {
    try {
      const sucursal = await db.sucursals.get(id);
      // Si la sucursal existe, la devuelve; si no, devuelve undefined
      return sucursal;
    } catch (error) {
      console.error(`Error al obtener el registro con ID ${id}:`, error);
    }
  }

  // --- Observador de Conexión y Carga de Datos ---
  connectivityStore.$subscribe((mutation, state) => {
    if (state.isOnline) {
      sincronizarPendientes();
    }
  });
  async function guardarRegistro(data) {
    const tempRecord = { ...data, id: Date.now() };
  }

  // --- Sincronización ---
  const API_URL = import.meta.env.VITE_API_URL;
  async function sincronizarPendientes() {
    if (!isOnline.value || pendientesCount.value === 0) return;
  }

  return {
    registros,
    pendientesCount,
    guardarRegistro,
    sincronizarPendientes,
    getAll,
    getAllSinAlmacen,
    getSucursalById,
  };
});
