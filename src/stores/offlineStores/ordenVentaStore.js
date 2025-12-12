// src/stores/dataStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { db } from "../../db.js";
import { useConnectivityStore } from "./useConnectivityStore.js";
import { useSucursalProductoStore } from "./sucursalProductoStore.js";
import { useClienteStore } from "./clienteStore.js";
import { useSucursalStore } from "./sucursalStore.js";
import { useUnidadMedidaStore } from "./unidadMedidaStore.js";
import { useCuentaCobrarStore } from "./cuentaCobrarStore.js";
import { useAuthStore } from "../authStore.js";
import api from "../../composables/axios.js";
import { useAppStore } from "../aplicacion/appStore.js";
export const useOrdenVentaStore = defineStore("ordenVentaStore", () => {
  const appStore = useAppStore();
  const connectivityStore = useConnectivityStore();
  const sucursalProductoStore = useSucursalProductoStore();
  const clienteStore = useClienteStore();
  const sucursalStore = useSucursalStore();
  const cuentaCobrarStore = useCuentaCobrarStore();
  const unidadMedidaStore = useUnidadMedidaStore();
  const authStore = useAuthStore();
  const isOnline = computed(() => connectivityStore.isOnline);
  const registros = ref([]);
  const pendientesCount = ref(0);

  //   GET REGISTROS
  const getAll = async () => {
    try {
      registros.value = await db.orden_ventas.toArray();
      return registros.value;
    } catch (error) {
      console.error("Error al obtener todas los registros:", error);
      return [];
    }
  };

  async function getOrdenVentaById(id) {
    try {
      const orden = await db.orden_ventas.get(id);
      // Si la orden existe, la devuelve; si no, devuelve undefined
      return orden;
    } catch (error) {
      console.error(`Error al obtener el registro con ID ${id}:`, error);
    }
  }
  async function getOrdenVentasByClient(clienteId) {
    try {
      const ordenesDelCliente = await db.orden_ventas
        .where("cliente_id") // El nombre de la columna (índice)
        .equals(clienteId) // El valor a buscar
        .toArray(); // Ejecuta la consulta y devuelve el array

      return ordenesDelCliente;
    } catch (error) {
      console.error(
        `Error al buscar registros por cliente ${clienteId}:`,
        error
      );
      return [];
    }
  }

  // GUARDAR
  async function guardarRegistro(data) {
    let ordenVentaId = 0;

    // Las tablas deben ser declaradas en el db.transaction para ser manipuladas.
    try {
      if (!data.sucursal_id) {
        throw new Error(`No se detecto la sucursal`);
      }
      if (!data.cliente_id) {
        throw new Error(`No se seleccionó ningun cliente`);
      }
      if (!data.cancelado && data.cancelado < 0) {
        throw new Error(`Debes ingresar el monto Cancelado`);
      }
      await db.transaction(
        "rw",
        db.orden_ventas,
        db.sucursal_productos,
        db.clientes,
        db.sucursals,
        db.cuenta_cobrars,
        async (tx) => {
          if (
            !data.orden_venta_detalles ||
            data.orden_venta_detalles.length === 0
          ) {
            throw new Error("La orden no tiene productos de detalle.");
          }
          // RECORRER LO DETALLES
          for (const detalle of data.orden_venta_detalles) {
            const productoId = detalle.producto_id;
            const cantidadVendida = detalle.cantidad;
            const sucursalId = data.sucursal_id; // La sucursal es la misma para toda la orden

            if (!detalle.cantidad) {
              throw new Error(
                `No se indico la cantidad vendida en una de las filas`
              );
            }

            // BUSCAR REGISTRO DE STOCK (sucursal_productos)
            // Buscamos por el ID del producto y el ID de la sucursal
            const registroStock =
              await sucursalProductoStore.getSucursalProductoByIdPS(
                sucursalId,
                productoId
              );

            console.log("Registro Stock:");
            console.log(registroStock);

            if (!registroStock) {
              throw new Error(
                `Stock no encontrado para Producto ID: ${productoId} en Sucursal ID: ${sucursalId}.`
              );
            }

            // Asegurar que 'stock' sea numérico para la comparación
            const stockActual = registroStock.stock_actual || 0;

            // VERIFICAR STOCK
            if (stockActual < cantidadVendida) {
              // Si el stock es insuficiente, lanzamos un error y el ROLLBACK es automático
              throw new Error(
                `Stock insuficiente para Producto: ${detalle.producto.nombre}. Disponible: ${stockActual}, Vendido: ${cantidadVendida}.`
              );
            }

            // ACTUALIZAR (DISMINUIR) STOCK
            const nuevoStock = stockActual - cantidadVendida;

            await db.sucursal_productos.update(registroStock.id_c, {
              stock_actual: nuevoStock,
            });
            console.log(
              `Stock actualizado para Producto ${productoId}. Nuevo Stock: ${nuevoStock}`
            );
          }

          // Crear el objeto
          const detallesParaDB = data.orden_venta_detalles.map((d) => ({
            producto_id: d.producto_id,
            unidad_medida_id: d.unidad_medida_id,
            cantidad: d.cantidad,
            precio: d.precio,
            descuento: d.descuento,
            subtotal: d.subtotal,
            subtotal_f: d.subtotal_f,
            unidad_medida: {
              id: d.unidad_medida.id,
              nombre: d.unidad_medida.nombre,
            },
            producto: {
              id: d.producto.id,
              codigo: d.producto.codigo,
              nombre: d.producto.nombre,
              precio: d.producto.precio,
              url_imagen: d.producto.url_imagen,
            },
          }));

          const cliente = await clienteStore.getClienteById(
            parseInt(data.cliente_id)
          );
          const sucursal = await sucursalStore.getSucursalById(
            parseInt(data.sucursal_id)
          );
          const fechaHoraCompleta = `${data.fecha}T${data.hora}`;
          const fechaObj = new Date(fechaHoraCompleta);
          if (isNaN(fechaObj)) {
            console.warn(
              "Fecha y/o hora de la data inválidas. Usando fecha/hora actual."
            );
            const now = new Date();
            data.fecha = data.fecha || now.toISOString().split("T")[0];
            data.hora =
              data.hora || now.toTimeString().split(" ")[0].substring(0, 5);
            fechaObj = new Date(`${data.fecha}T${data.hora}`);
          }

          const dia = String(fechaObj.getDate()).padStart(2, "0");
          const mes = String(fechaObj.getMonth() + 1).padStart(2, "0"); // Mínimo 1
          const anio = fechaObj.getFullYear();
          const horas = String(fechaObj.getHours()).padStart(2, "0");
          const minutos = String(fechaObj.getMinutes()).padStart(2, "0");

          const fecha_c = `${dia}/${mes}/${anio} ${horas}:${minutos}`;
          const opcionesFormato = {
            day: "numeric",
            month: "long", // 'long' da el nombre completo del mes
            year: "numeric",
          };
          const fecha_ct = fechaObj.toLocaleDateString(
            "es-ES",
            opcionesFormato
          );

          const nuevoRegistro = {
            codigo: "OV.OFF",
            sucursal_id: data.sucursal_id,
            cliente_id: data.cliente_id,
            cliente: cliente,
            sucursal: sucursal,
            fecha: data.fecha,
            hora: data.hora,
            fecha_c: "" + fecha_c,
            fecha_ct: "" + fecha_ct,
            cantidad_total: data.cantidad_total,
            cs_f: data.cs_f,
            forma_pago: data.forma_pago,
            cancelado: data.cancelado,
            cambio: data.cambio,
            total: data.total,
            total_st: data.total_st,
            solicitud_descuento: data.solicitud_descuento,
            solicitud_sw: data.solicitud_sw,
            monto_solicitud: data.monto_solicitud,
            descuento: data.descuento,
            total_f: data.total_f,
            estado: "FINALIZADO",
            verificado: 1,
            user_id: authStore?.user.id,
            user: {
              id: authStore?.user.id,
              nombre: authStore?.user.nombre,
              paterno: authStore?.user.paterno,
              materno: authStore?.user.materno,
            },
            orden_venta_detalles: detallesParaDB,
            sync: false,
          };
          // Insertar la cabecera y obtener el ID generado (clave primaria)
          ordenVentaId = await db.orden_ventas.add({ ...nuevoRegistro });
          console.log(`Orden de Venta ID insertada: ${ordenVentaId}`);

          // VERIFICAR TIPO DE PAGO
          if (nuevoRegistro.forma_pago == "CRÉDITO") {
            const now = new Date();
            const saldo =
              parseFloat(nuevoRegistro.total_f) -
              parseFloat(nuevoRegistro.cancelado);
            const orden_venta = await db.orden_ventas.get(ordenVentaId);
            const data = {
              cliente_id: nuevoRegistro.cliente_id,
              cliente: cliente,
              orden_venta: orden_venta,
              orden_venta_id: ordenVentaId,
              total: nuevoRegistro.total_f,
              cancelado: nuevoRegistro.cancelado,
              saldo: saldo,
              fecha: now.toISOString().slice(0, 10),
              hora: now.toTimeString().slice(0, 5),
              cuenta_cobrar_detalles: [],
              sync: false,
            };
            cuentaCobrarStore.nuevaCuentaCobrar(data);
          }

          // ------------------------------------------------------------------
          // COMMIT (Automático al salir del bloque sin error)
          // ------------------------------------------------------------------

          console.log(
            "Todas las operaciones completadas. Commit automático exitoso."
          );
        }
      ); // Fin de la transacción

      return ordenVentaId; // Devuelve el ID de la orden creada
    } catch (error) {
      // ROLLBACK (Automático al capturar cualquier error dentro de la transacción)
      console.error(
        "Transacción de Orden de Venta fallida (rollback):",
        error.message
      );
      throw error; // Propagar el error
    }
  }

  // --- Observador de Conexión y Carga de Datos ---
  connectivityStore.$subscribe((mutation, state) => {
    if (state.isOnline) {
      sincronizarPendientes();
    }
  });

  // --- Sincronización ---
  const API_URL = import.meta.env.VITE_API_URL;
  async function sincronizarPendientes() {
    console.log("Sincronizado: ");
    const registros = await db.orden_ventas.toArray();
    const pendientes = registros.filter((registro) => {
      return registro.sync !== true;
    });
    // const pendientes = await db.orden_ventas.where({ sync: false }).toArray();
    if (pendientes.length == 0) {
      return;
    }
    console.log("Sincronizado: ");
    console.log(pendientes);
    appStore.setSync(true);
    pendientes.forEach(async (elem) => {
      // cuenta_cobrar
      const cuenta_cobrar = await cuentaCobrarStore.getCuentaCobrarByOrdenId(
        parseInt(elem.id)
      );
      console.log(cuenta_cobrar);
      try {
        await api.post(API_URL + "/orden_ventas/sincronizar", {
          orden_venta: elem,
          cuenta_cobrar: cuenta_cobrar ?? null,
        });
        if (cuenta_cobrar) {
          // ELIMINAR CUENTA COBRAR
          console.log("elimina cuenta cobrar");
          await db.cuenta_cobrars.delete(cuenta_cobrar.id);
        }
        console.log("registrado");
      } catch (error) {
        console.log(error);
      } finally {
      }
    });
    appStore.setSync(false);
    console.log("eliminar registros");
    const ids = pendientes.map((p) => p.id);
    await db.orden_ventas.bulkDelete(ids);

    // SEGUIDO SINCRONIZAR CUENTAS POR PAGAR
    cuentaCobrarStore.sincronizarPendientes();
  }

  return {
    registros,
    guardarRegistro,
    sincronizarPendientes,
    getAll,
    getOrdenVentaById,
    guardarRegistro,
  };
});
