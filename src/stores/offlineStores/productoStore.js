// src/stores/dataStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { db } from "../../db.js";
import { useConnectivityStore } from "./useConnectivityStore.js";

export const useProductoStore = defineStore("productoStore", () => {
  const connectivityStore = useConnectivityStore();
  const isOnline = computed(() => connectivityStore.isOnline);
  const registros = ref([]);
  const pendientesCount = ref(0);

  //   GET REGISTROS
  const getAll = async () => {
    try {
      registros.value = await db.productos.toArray();
      return registros.value;
    } catch (error) {
      console.error("Error al obtener todas los registros:", error);
      return [];
    }
  };

  async function getProductoById(id) {
    try {
      const orden = await db.productos.get(id);
      // Si la orden existe, la devuelve; si no, devuelve undefined
      return orden;
    } catch (error) {
      console.error(`Error al obtener el registro con ID ${id}:`, error);
    }
  }
  async function getProductoByCodigo(codigo) {
    try {
      const codigoBuscado = String(codigo).toUpperCase();
      console.log(codigoBuscado);
      const producto = await db.productos
        .where("codigo")
        .equals(codigoBuscado)
        .first();
      return producto;
    } catch (error) {
      console.error(`Error al buscar registros por producto ${codigo}:`, error);
      return [];
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
    getProductoById,
    getProductoByCodigo,
  };
});
