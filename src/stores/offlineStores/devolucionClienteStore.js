// src/stores/dataStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { db } from "../../db.js";
import { useConnectivityStore } from "./useConnectivityStore.js";
import { useSucursalProductoStore } from "./sucursalProductoStore.js";
import { useAuthStore } from "../authStore.js";

export const useDevolucionClienteStore = defineStore(
  "devolucion_clienteStore",
  () => {
    const connectivityStore = useConnectivityStore();
    const sucursalProductoStore = useSucursalProductoStore();
    const authStore = useAuthStore();
    const isOnline = computed(() => connectivityStore.isOnline);
    const registros = ref([]);
    const pendientesCount = ref(0);

    //   GET REGISTROS
    const getAll = async () => {
      try {
        registros.value = await db.devolucion_clientes.toArray();
        return registros.value;
      } catch (error) {
        console.error("Error al obtener todas los registros:", error);
        return [];
      }
    };

    async function getDevolucionClienteById(id) {
      try {
        const devolucion_cliente = await db.devolucion_clientes.get(id);
        // Si la devolucion_cliente existe, la devuelve; si no, devuelve undefined
        return devolucion_cliente;
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
      let devolucion_clienteId = 0;

      // Las tablas deben ser declaradas en el db.transaction para ser manipuladas.
      try {
        if (!data.sucursal_id) {
          throw new Error(`Debes seleccionar la sucursal`);
        }
        if (!data.cliente_id) {
          throw new Error(`Debes seleccionar un cliente`);
        }
        if (!data.cantidad_total) {
          throw new Error(`No se encontró el total`);
        }
        if (!data.fecha) {
          throw new Error(`Debes ingresar la fecha`);
        }
        if (!data.hora) {
          throw new Error(`Debes ingresar la hora`);
        }

        await db.transaction(
          "rw",
          db.devolucion_clientes,
          db.sucursal_productos,
          async (tx) => {
            if (
              !data.devolucion_cliente_detalles ||
              data.devolucion_cliente_detalles.length === 0
            ) {
              throw new Error("No se agregó ningún producto.");
            }
            // RECORRER LOS DETALLES
            for (const contacto of data.devolucion_cliente_detalles) {
              const producto_id = contacto.producto_id;
              const cantidad = contacto.cantidad;
              const costo = contacto.costo;
              const subtotal = contacto.subtotal;

              if (!producto_id) {
                throw new Error(
                  `No se encontró el producto en una de las filas`
                );
              }
              if (!cantidad) {
                throw new Error(
                  `No se indico la cantidad devuelta en una de las filas`
                );
              }

              // BUSCAR REGISTRO DE STOCK (sucursal_productos)
              // Buscamos por el ID del producto y el ID de la sucursal
              const registroStock =
                await sucursalProductoStore.getSucursalProductoByIdPS(
                  parseInt(data.sucursal_id),
                  parseInt(producto_id)
                );
              if (!registroStock) {
                throw new Error(
                  `Stock no encontrado para Producto ID: ${producto_id} en Sucursal ID: ${data.sucursal_id}.`
                );
              }

              // Asegurar que 'stock' sea numérico para la comparación
              const stockActual = registroStock.stock_actual || 0;
              // ACTUALIZAR (AUMENTAR) STOCK
              const nuevoStock = stockActual + parseFloat(cantidad);

              await db.sucursal_productos.update(registroStock.id_c, {
                stock_actual: nuevoStock,
              });
              console.log(
                `Stock actualizado para Producto ${producto_id}. Nuevo Stock: ${nuevoStock}`
              );
            }

            // Crear el objeto
            const detallesParaDB = data.devolucion_cliente_detalles.map(
              (d) => ({
                nombre: d.nombre,
                fono: d.fono,
                cel: d.cel,
                observacion: d.observacion,
                producto: {
                  id: d.producto.id,
                  codigo: d.producto.codigo,
                  nombre: d.producto.nombre,
                  precio: d.producto.precio,
                  url_imagen: d.producto.url_imagen,
                },
              })
            );

            const nuevoRegistro = {
              sucursal_id: data.sucursal_id,
              cliente_id: data.cliente_id,
              cantidad_total: data.cantidad_total,
              total: data.total,
              fecha: data.fecha,
              hora: data.hora,
              observaciones: data.observaciones,
              devolucion_cliente_detalles: detallesParaDB,
              user_id: authStore?.user.id,
              user: {
                id: authStore?.user.id,
                nombre: authStore?.user.nombre,
                paterno: authStore?.user.paterno,
                materno: authStore?.user.materno,
              },
              sync: false,
            };
            // Insertar la cabecera y obtener el ID generado (clave primaria)
            devolucion_clienteId = await db.devolucion_clientes.add({
              ...nuevoRegistro,
            });
            console.log(
              `DevolucionCliente ID insertada: ${devolucion_clienteId}`
            );
            // ------------------------------------------------------------------
            // COMMIT (Automático al salir del bloque sin error)
            // ------------------------------------------------------------------
            console.log(
              "Todas las operaciones completadas. Commit automático exitoso."
            );
          }
        ); // Fin de la transacción

        return devolucion_clienteId; // Devuelve el ID de la orden creada
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
      getDevolucionClienteById,
    };
  }
);
