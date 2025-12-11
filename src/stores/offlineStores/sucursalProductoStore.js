// src/stores/dataStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { db } from "../../db.js";
import { useConnectivityStore } from "./useConnectivityStore.js";

export const useSucursalProductoStore = defineStore(
  "sucursal_productoStore",
  () => {
    const connectivityStore = useConnectivityStore();
    const isOnline = computed(() => connectivityStore.isOnline);
    const registros = ref([]);
    const pendientesCount = ref(0);

    //   GET REGISTROS
    const getAll = async () => {
      try {
        registros.value = await db.sucursal_productos.toArray();
        return registros.value;
      } catch (error) {
        console.error("Error al obtener todas los registros:", error);
        return [];
      }
    };

    async function getSucursalproductoById(id) {
      try {
        const sucursal_producto = await db.sucursal_productos.get(id);
        // Si la sucursal_producto existe, la devuelve; si no, devuelve undefined
        return sucursal_producto;
      } catch (error) {
        console.error(`Error al obtener el registro con ID ${id}:`, error);
      }
    }

    async function getSucursalProductoByIdPS(sucursal_id, producto_id) {
      try {
        const sucursal_producto = await db.sucursal_productos
          .where({
            sucursal_id: sucursal_id,
            producto_id: producto_id,
          })
          .first();
        // Si la sucursal_producto existe, la devuelve; si no, devuelve undefined
        return sucursal_producto;
      } catch (error) {
        console.error(
          `Error al obtener el registro con SUCURSAL_ID ${sucursal_id} y PRODUCTO_ID ${producto_id}:`,
          error
        );
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
      getSucursalproductoById,
      getSucursalProductoByIdPS,
    };
  }
);
