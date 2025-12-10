// src/stores/dataStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { db } from "../../db.js";
import { useConnectivityStore } from "./useConnectivityStore.js";

export const useOrdenVentaStore = defineStore("data", () => {
  const connectivityStore = useConnectivityStore();
  const isOnline = computed(() => connectivityStore.isOnline);
  const registros = ref([]);
  const pendientesCount = ref(0);

  //   GET REGISTROS
  const getAll = async () => {
    try {
      registros.value = await db.orden_ventas.toArray();
      return registros.value;
    } catch (error) {
      console.error("Error al obtener todas las órdenes:", error);
      return [];
    }
  };

  async function getOrderById(id) {
    try {
      const orden = await db.orden_ventas.get(id);
      // Si la orden existe, la devuelve; si no, devuelve undefined
      return orden;
    } catch (error) {
      console.error(`Error al obtener la orden con ID ${id}:`, error);
    }
  }
  async function getOrdersByClient(clienteId) {
    try {
      const ordenesDelCliente = await db.orden_ventas
        .where("cliente_id") // El nombre de la columna (índice)
        .equals(clienteId) // El valor a buscar
        .toArray(); // Ejecuta la consulta y devuelve el array

      return ordenesDelCliente;
    } catch (error) {
      console.error(`Error al buscar órdenes por cliente ${clienteId}:`, error);
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
    getOrderById,
  };
});
