// src/stores/dataStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { db } from "../../db.js";
import { useConnectivityStore } from "./useConnectivityStore.js";

export const useClienteStore = defineStore("clienteStore", () => {
  const connectivityStore = useConnectivityStore();
  const isOnline = computed(() => connectivityStore.isOnline);
  const registros = ref([]);
  const pendientesCount = ref(0);

  //   GET REGISTROS
  const getAll = async () => {
    try {
      registros.value = await db.clientes.toArray();
      return registros.value;
    } catch (error) {
      console.error("Error al obtener todas los registros:", error);
      return [];
    }
  };

  async function getClienteById(id) {
    try {
      const cliente = await db.clientes.get(id);
      // Si la cliente existe, la devuelve; si no, devuelve undefined
      return cliente;
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
    let clienteId = 0;

    // Las tablas deben ser declaradas en el db.transaction para ser manipuladas.
    try {
      if (!data.razon_social) {
        throw new Error(`Debes ingresar la razon social`);
      }
      if (!data.nit) {
        throw new Error(`Debes ingresar el NIT`);
      }
      if (!data.nombre_punto) {
        throw new Error(`Debes ingresar el nombre de punto de venta`);
      }
      if (!data.nombre_prop) {
        throw new Error(`Debes ingresar el nombre de propietario`);
      }
      if (!data.ci_prop) {
        throw new Error(`Debes ingresar la cedula de identidad`);
      }
      if (!data.cel) {
        throw new Error(`Debes ingresar el celular`);
      }
      if (!data.fono) {
        throw new Error(`Debes ingresar el teléfono`);
      }
      if (!data.dir) {
        throw new Error(`Debes ingresar la dirección`);
      }
      if (!data.latitud) {
        throw new Error(`Debes ingresar la latitud GPS`);
      }
      if (!data.longitud) {
        throw new Error(`Debes ingresar la longitud GPS`);
      }
      if (!data.ciudad) {
        throw new Error(`Debes ingresar la ciudad`);
      }
      if (data.contactos.length < 1) {
        throw new Error(`Debes ingresar al menos un contacto`);
      }

      await db.transaction("rw", db.clientes, async (tx) => {
        if (!data.contactos || data.contactos.length === 0) {
          throw new Error("No se agregó ningún contacto.");
        }
        // RECORRER LOS CONTACTOS
        for (const contacto of data.contactos) {
          const nombre_c = contacto.nombre;
          const fono_c = contacto.fono;
          const cel_c = data.cel; // La sucursal es la misma para toda la orden

          if (!nombre_c) {
            throw new Error(
              `No se indico el nombre de contacto en una de las filas`
            );
          }
          if (!fono_c) {
            throw new Error(
              `No se indico el teléfono de contacto en una de las filas`
            );
          }
          if (!cel_c) {
            throw new Error(
              `No se indico el celular de contacto en una de las filas`
            );
          }
        }

        // Crear el objeto
        const detallesParaDB = data.contactos.map((d) => ({
          nombre: d.nombre,
          fono: d.fono,
          cel: d.cel,
          observacion: d.observacion,
        }));

        const nuevoRegistro = {
          razon_social: data.razon_social,
          tipo: data.tipo,
          nit: data.nit,
          nombre_punto: data.nombre_punto,
          nombre_prop: data.nombre_prop,
          ci_prop: data.ci_prop,
          correo: data.correo,
          cel: data.cel,
          fono: data.fono,
          dir: data.dir,
          latitud: data.latitud,
          longitud: data.longitud,
          ciudad: data.ciudad,
          contactos: detallesParaDB,
          estado: data.estado,
          sync: false,
        };
        // Insertar la cabecera y obtener el ID generado (clave primaria)
        clienteId = await db.clientes.add({ ...nuevoRegistro });
        console.log(`Cliente ID insertada: ${clienteId}`);
        // ------------------------------------------------------------------
        // COMMIT (Automático al salir del bloque sin error)
        // ------------------------------------------------------------------
        console.log(
          "Todas las operaciones completadas. Commit automático exitoso."
        );
      }); // Fin de la transacción

      return clienteId; // Devuelve el ID de la orden creada
    } catch (error) {
      // ROLLBACK (Automático al capturar cualquier error dentro de la transacción)
      console.error(
        "Transacción de Orden de Venta fallida (rollback):",
        error.message
      );
      throw error; // Propagar el error
    }
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
    getClienteById,
  };
});
