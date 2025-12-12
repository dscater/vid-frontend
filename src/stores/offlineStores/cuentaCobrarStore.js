// src/stores/dataStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { db } from "../../db.js";
import { useConnectivityStore } from "./useConnectivityStore.js";

import { useAppStore } from "../aplicacion/appStore.js";
import api from "../../composables/axios.js";
export const useCuentaCobrarStore = defineStore("cuenta_cobrarStore", () => {
  const appStore = useAppStore();
  const connectivityStore = useConnectivityStore();
  const isOnline = computed(() => connectivityStore.isOnline);
  const registros = ref([]);
  const pendientesCount = ref(0);

  //   GET REGISTROS
  const getAll = async () => {
    try {
      registros.value = await db.cuenta_cobrars.toArray();
      return registros.value;
    } catch (error) {
      console.error("Error al obtener todas los registros:", error);
      return [];
    }
  };

  async function getCuentaCobrarById(id) {
    try {
      const cuenta_cobrar = await db.cuenta_cobrars.get(id);
      // Si la cuenta_cobrar existe, la devuelve; si no, devuelve undefined
      return cuenta_cobrar;
    } catch (error) {
      console.error(`Error al obtener el registro con ID ${id}:`, error);
    }
  }

  async function getCuentaCobrarByOrdenId(orden_venta_id) {
    try {
      const codigoBuscado = parseInt(orden_venta_id);
      const cuenta_cobrar = await db.cuenta_cobrars
        .where("orden_venta_id")
        .equals(codigoBuscado)
        .first();
      console.log("CUENTA COBRAR");
      console.log(cuenta_cobrar);
      return cuenta_cobrar;
    } catch (error) {
      console.error(`Error al buscar registros por producto ${codigo}:`, error);
      return [];
    }
  }

  async function nuevaCuentaCobrar(data) {
    try {
      cuentaCobrarId = await db.cuenta_cobrars.add({ ...data });

      return cuentaCobrarId;
    } catch (error) {
      console.error(`Error al crear Cuenta por Cobrar:`, error);
    }
  }

  async function nuevoPago(id, data) {
    try {
      const key = parseInt(id);

      const cuenta_cobrar = await db.cuenta_cobrars.get(key);
      if (!cuenta_cobrar) return;

      if (!Array.isArray(cuenta_cobrar.cuenta_cobrar_detalles)) {
        cuenta_cobrar.cuenta_cobrar_detalles = [];
      }

      cuenta_cobrar.cuenta_cobrar_detalles.push(data);

      cuenta_cobrar.cancelado =
        parseFloat(cuenta_cobrar.cancelado) + parseFloat(data.cancelado);
      cuenta_cobrar.saldo =
        parseFloat(cuenta_cobrar.total) - parseFloat(cuenta_cobrar.cancelado);
      cuenta_cobrar.sync = false;
      await db.cuenta_cobrars.put(cuenta_cobrar);
      return cuenta_cobrar;
    } catch (error) {
      console.error("Error al crear Cuenta por Cobrar:", error);
    }
  }

  // --- Observador de Conexión y Carga de Datos ---
  // connectivityStore.$subscribe((mutation, state) => {
  //   if (state.isOnline) {
  //     sincronizarPendientes();
  //   }
  // });
  async function guardarRegistro(data) {
    const tempRecord = { ...data, id: Date.now() };
  }

  // --- Sincronización ---
  const API_URL = import.meta.env.VITE_API_URL;
  async function sincronizarPendientes() {
    console.log("Sincronizado: ");
    const registros = await db.cuenta_cobrars.toArray();
    const pendientes = registros.filter((registro) => {
      return registro.sync !== true;
    });
    // const pendientes = await db.cuenta_cobrars.where({ sync: false }).toArray();
    if (pendientes.length == 0) {
      return;
    }
    console.log("Sincronizado: ");
    console.log(pendientes);
    appStore.setSync(true);
    api
      .post(API_URL + "/cuenta_cobrars/sincronizar", {
        cuenta_cobrars: pendientes,
      })
      .then(async (response) => {
        console.log("eliminar registros");
        const ids = pendientes.map((p) => p.id);
        await db.cuenta_cobrars.bulkDelete(ids);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        appStore.setSync(false);
      });
  }

  return {
    registros,
    pendientesCount,
    guardarRegistro,
    sincronizarPendientes,
    getAll,
    getCuentaCobrarById,
    nuevaCuentaCobrar,
    nuevoPago,
    getCuentaCobrarByOrdenId,
  };
});
