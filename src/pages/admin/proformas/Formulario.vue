<script setup>
  import {
    watch,
    ref,
    computed,
    onMounted,
    nextTick,
    reactive,
    onBeforeMount,
    onUnmounted,
  } from "vue";
  import api from "../../../composables/axios.js";
  import { useRouter } from "vue-router";
  import { useAuthStore } from "../../../stores/authStore";
  import { useSucursalStore } from "../../../stores/offlineStores/sucursalStore";
  import { useClienteStore } from "../../../stores/offlineStores/clienteStore";
  import { useProductoStore } from "../../../stores/offlineStores/productoStore";
  import { useProformaStore } from "../../../stores/offlineStores/proformaStore";
  import { useUnidadMedidaStore } from "../../../stores/offlineStores/unidadMedidaStore";
  import { useConnectivityStore } from "../../../stores/offlineStores/useConnectivityStore";
  import Verifica from "./Verifica.vue";
  const connectivityStore = useConnectivityStore();
  const proformaStore = useProformaStore();
  const sucursalStore = useSucursalStore();
  const clienteStore = useClienteStore();
  const productoStore = useProductoStore();
  const unidadMedidaStore = useUnidadMedidaStore();
  const authStore = useAuthStore();
  const router = useRouter();
  // TOAST
  import { toast } from "vue3-toastify";
  import "vue3-toastify/dist/index.css";
  const props = defineProps({
    proforma: {
      type: Object,
      default: null,
    },
  });

  const enviando = ref(false);
  let form = reactive(props.proforma);
  const nuevoProducto = ref({
    cantidad: 1,
    codigoProducto: "",
  });

  watch(
    () => props.proforma,
    (newValue) => {
      form = newValue;
      verificarProforma();
    },
  );

  const textBtn = computed(() => {
    if (enviando.value) {
      return `<i class="fa fa-spin fa-spinner"></i> Enviando...`;
    }
    if (form.id == 0) {
      return `<i class="fa fa-save"></i> Guardar Proforma`;
    }
    return `<i class="fa fa-edit"></i> Actualizar Proforma`;
  });

  const enviarFormulario = async () => {
    enviando.value = true;
    if (validarDetalles()) {
      enviando.value = true;
      if (connectivityStore.isOnline) {
        let url =
          form.id == 0 ? "/admin/proformas" : "/admin/proformas/" + form.id;

        api
          .post(url, form)
          .then((response) => {
            console.log(response);

            const success =
              response.data.message ?? "Proceso realizado con éxito";
            Swal.fire({
              icon: "success",
              title: "Correcto",
              html: `<strong>${success}</strong>`,
              confirmButtonText: `Aceptar`,
              customClass: {
                confirmButton: "btn-success",
              },
            });
            router.push({
              name: "proformas.index",
            });
            // router.push({ name: "proformas.index" });
          })
          .catch((error) => {
            if (
              error.response &&
              error.response.data &&
              error.response.data.errors
            ) {
              const msgError = error.response.data.errors.error
                ? error.response.data.errors.error[0]
                : "Existen errores en el formulario, por favor verifique";
              Swal.fire({
                icon: "info",
                title: "Error",
                html: `<strong>${msgError}</strong>`,
                confirmButtonText: `Aceptar`,
                customClass: {
                  confirmButton: "btn-error",
                },
              });
              form.errors = error.response.data.errors;
            } else {
              const msgError =
                "Ocurrió un error inesperado contactese con el Administrador";
              Swal.fire({
                icon: "info",
                title: "Error",
                html: `<strong>${msgError}</strong>`,
                confirmButtonText: `Aceptar`,
                customClass: {
                  confirmButton: "btn-error",
                },
              });
              console.error("Error inesperado:", error);
            }
          })
          .finally(() => {
            enviando.value = false;
          });
      } else {
        // OFFLINE
        try {
          const resp = await proformaStore.guardarRegistro(form);
          console.log(resp);
          if (resp) {
            const success = "Proceso realizado con éxito";
            Swal.fire({
              icon: "success",
              title: "Correcto",
              html: `<strong>${success}</strong>`,
              confirmButtonText: `Aceptar`,
              customClass: {
                confirmButton: "btn-success",
              },
            });
            router.push({
              name: "proformas.imprimir",
              params: {
                id: resp,
              },
            });
            // router.push({ name: "proformas.index" });
            enviando.value = false;
          } else {
            Swal.fire({
              icon: "error",
              title: "Error",
              html: `<strong>Ocurrió un error inesperado intente nuevamente y verifique que todos los campos esten llenados correctamente</strong>`,
              confirmButtonText: `Aceptar`,
              customClass: {
                confirmButton: "btn-success",
              },
            });
          }
        } catch (error) {
          enviando.value = false;
          console.log(error);
          Swal.fire({
            icon: "error",
            title: "Error",
            html: `<strong>${error}</strong>`,
            confirmButtonText: `Aceptar`,
            customClass: {
              confirmButton: "btn-success",
            },
          });
        }
      }
    }
  };

  const listSucursals = ref([]);
  const cargarSucursals = async () => {
    if (connectivityStore.isOnline) {
      api.get("/admin/sucursals/listadoSP").then((response) => {
        listSucursals.value = response.data.sucursals;
      });
    } else {
      listSucursals.value = await sucursalStore.getAllSinAlmacen();
    }
  };

  const listUnidadMedidas = ref([]);
  const cargarUnidadMedidas = async () => {
    if (connectivityStore.isOnline) {
      api.get("/admin/unidad_medidas/listado").then((response) => {
        listUnidadMedidas.value = response.data.unidad_medidas;
      });
    } else {
      listUnidadMedidas.value = await unidadMedidaStore.getAll();
    }
  };

  const listClientes = ref([]);
  const loadingClientes = ref(false);
  const intervalClientes = ref(null);
  const onInputSelectClientes = (event) => {
    let query = "";
    if (typeof event === "string") {
      query = event;
    } else if (event?.target?.value) {
      query = event.target.value;
    }

    if (query.length >= 1) {
      clearInterval(intervalClientes.value);
      intervalClientes.value = setTimeout(() => {
        remoteMethodClientes(query);
      }, 400);
    }
  };
  const remoteMethodClientes = async (query) => {
    if (query !== "") {
      loadingClientes.value = true;
      try {
        let response = null;
        if (connectivityStore.isOnline) {
          response = await api.get(
            "/admin/clientes/listadoSelectElementUi" +
              `?search=${encodeURIComponent(query)}`,
          );
        } else {
          response = { data: { clientes: [] } };
          response.data.clientes = await clienteStore.getAll();
        }
        const data = response ? response.data.clientes : [];
        // Suponiendo que data es un array de clientes [{id, nombre}]
        listClientes.value = data.map((cliente) => ({
          value: cliente.id,
          // label: `${cliente.razon_social} - ${cliente.ci}`,
          label: `${cliente.razon_social}`,
        }));
      } catch (error) {
        console.log(error);
        listClientes.value = [];
      }
      loadingClientes.value = false;
    } else {
      listClientes.value = [];
    }
  };

  const oCliente = ref(null);
  const detectarCliente = async (value) => {
    console.log("CLIENTE");
    console.log(value);
    oCliente.value = null;
    if (connectivityStore.isOnline) {
      api.get("/admin/clientes/" + value).then((response) => {
        oCliente.value = response.data;
      });
    } else {
      const listClientesData = await clienteStore.getAll();
      oCliente.value = listClientesData.filter((elem) => {
        return elem.id == value;
      })[0];
    }
  };

  const listProductos = ref([]);
  const loadingProductos = ref(false);
  const intervalProductos = ref(null);
  const onInputSelectProductos = (event) => {
    let query = "";
    if (typeof event === "string") {
      query = event;
    } else if (event?.target?.value) {
      query = event.target.value;
    }

    if (query.length >= 1) {
      clearInterval(intervalProductos.value);
      intervalProductos.value = setTimeout(() => {
        remoteMethodProductos(query);
      }, 400);
    }
  };
  const remoteMethodProductos = async (query) => {
    if (!query || query.length < 1) {
      return;
    }
    loadingProductos.value = true;
    try {
      let response = null;
      if (connectivityStore.isOnline) {
        response = await api.get(
          "/admin/productos/byCodigoListSelectElementUi" +
            `?search=${encodeURIComponent(query)}`,
        );
      } else {
        response = { data: { productos: [] } };
        response.data.productos = await productoStore.getAll();
      }
      const data = response ? response.data.productos : [];
      // Suponiendo que data es un array de productos [{id, nombre}]
      listProductos.value = data.map((producto) => ({
        value: producto.id,
        // label: `${producto.codigo} - ${producto.ci}`,
        label: `${producto.codigo} | ${producto.nombre} ${producto.unidad_medida.nombre}`,
      }));
    } catch (error) {
      console.log(error);
      listProductos.value = [];
    } finally {
      loadingProductos.value = false;
    }
  };

  /**
   * PRODUCTOS
   */

  const agregarProducto = () => {
    form.proforma_productos.push({
      id: "",
      proforma_id: "",
      producto_id: "",
      precio: "",
      unidad_medida_id: "",
      stock_actual: 0,
      stock_actual_aux: 0,
      producto: null,
    });

    // AGREGAR COLUMNA
    // agregar el detalle
    form.proforma_detalles.forEach((elem, index) => {
      elem.proforma_detalle_productos.push({
        id: "",
        proforma_id: "",
        proforma_detalle_id: "",
        producto_id: elem.producto_id ?? "",
        unidad_medida_id: elem.unidad_medida_id ?? "",
        cantidad: "",
        resta: "",
        cantidad_entregada: "",
        precio: elem.precio ?? "",
        subtotal: "",
        verificado: 0,
      });
    });
  };

  const quitarProducto = (id, col) => {
    if (id && id != 0) {
      form.eliminados_productos.push(id);
    }
    form.proforma_productos.splice(col, 1);

    form.proforma_detalles.forEach((elem, fila) => {
      elem.proforma_detalle_productos.splice(col, 1);
      sumaTotalPorFila(fila);
    });
  };

  const actualizarStockProductos = async () => {
    form.proforma_productos.forEach(async (elem, col) => {
      obtenerStockProducto(elem.producto_id, col);
    });

    setTimeout(() => {
      recalcularCantidades();
    }, 500);
  };

  const actualizarStockAuxProductos = async () => {
    form.proforma_productos.forEach(async (elem, col) => {
      obtenerAuxSucursaleProductos(elem.producto_id, col);
    });

    setTimeout(() => {
      recalcularCantidades();
    }, 1000);
  };

  const obtenerAuxSucursaleProductos = async (value, col) => {
    // SUMAR EL TOTAL DE STOCK
    let total = 0;

    const requests = form.sucursal_ids.map((element) =>
      api.get("/admin/sucursal_productos/getSucursalProducto", {
        params: {
          producto_id: value,
          sucursal_id: element,
        },
      }),
    );

    const responses = await Promise.all(requests);

    responses.forEach((resp) => {
      total += parseFloat(resp.data.sucursal_producto.stock_actual);
    });

    api.get("/admin/productos/" + value).then((response) => {
      form.proforma_productos[col].stock_actual_aux = total;
    });
  };

  const stockPorSucursales = ref({});
  const obtenerStockProducto = async (value, col) => {
    if (!form.proforma_productos[col]) return;

    let total = 0;
    stockPorSucursales.value[value] = [];
    const requests = form.sucursal_ids.map((sucursal_id) =>
      api.get("/admin/sucursal_productos/getSucursalProducto", {
        params: {
          producto_id: value,
          sucursal_id: sucursal_id,
        },
      }),
    );

    const responses = await Promise.all(requests);

    responses.forEach((resp, index) => {
      const sucursal_id = form.sucursal_ids[index];

      const stock = parseFloat(resp.data.sucursal_producto?.stock_actual ?? 0);

      const sucursalNombre =
        resp.data.sucursal_producto?.sucursal?.nombre ?? "Sin sucursal";
      stockPorSucursales.value[value].push({
        sucursal_id,
        sucursal: sucursalNombre,
        stock,
      });

      total += stock;
    });

    const response = await api.get("/admin/productos/" + value);
    if (response.data) {
      form.proforma_productos[col].producto_id = response.data.id;
      form.proforma_productos[col].producto = response.data;
      form.proforma_productos[col].precio = response.data.precio;
      form.proforma_productos[col].unidad_medida_id =
        response.data.unidad_medida_id;
      form.proforma_productos[col].stock_actual = total;
      form.proforma_productos[col].stock_actual_aux = total;

      form.proforma_detalles.forEach((_, fila) => {
        sumaTotalPorFila(fila);
      });
    }
  };

  /** ***********************
   *DETALLES
   * ***************************
   */
  const agregarDetalle = () => {
    // preparar los productos
    let proforma_detalle_productos = [];
    form.proforma_productos.forEach((elem) => {
      proforma_detalle_productos.push({
        id: "",
        proforma_id: "",
        proforma_detalle_id: "",
        producto_id: elem.producto_id ?? "",
        unidad_medida_id: elem.unidad_medida_id ?? "",
        cantidad: "",
        resta: "",
        cantidad_entregada: "",
        precio: elem.precio ?? "",
        subtotal: "",
        verificado: 0,
      });
    });

    // agregar el detalle
    form.proforma_detalles.push({
      id: "",
      proforma_id: "",
      cliente_id: "",
      cantidad: "",
      cantidad_entregada: "",
      precio: "",
      total: "",
      estado: "",
      verificado: 0,
      proforma_detalle_productos: proforma_detalle_productos,
    });
  };

  const stockSuperado = ref(false);
  const actualizaStockProducto = (index_col, fila) => {
    getTotalColumna(index_col);
    sumaTotalPorFila(fila);
  };

  const sumaTotalPorFila = (fila) => {
    let total = 0;
    let total_cantidad = 0;
    form.proforma_detalles[fila].proforma_detalle_productos.forEach(
      (elem_detalle, index_col) => {
        if (elem_detalle.cantidad) {
          form.proforma_detalles[fila].proforma_detalle_productos[
            index_col
          ].precio = parseFloat(form.proforma_productos[index_col].precio);
          total +=
            parseFloat(elem_detalle.cantidad) *
            parseFloat(form.proforma_productos[index_col].precio);
          total_cantidad += parseFloat(elem_detalle.cantidad);
          form.proforma_detalles[fila].proforma_detalle_productos[
            index_col
          ].subtotal =
            parseFloat(elem_detalle.cantidad) *
            parseFloat(form.proforma_productos[index_col].precio);
        }
      },
    );
    form.proforma_detalles[fila].total = total == 0 ? "" : total;
    form.proforma_detalles[fila].saldo = total == 0 ? "" : total;
    form.proforma_detalles[fila].cantidad =
      total_cantidad == 0 ? "" : total_cantidad;
  };

  const quitarDetalle = (id, index) => {
    if (id != 0) {
      // RESTAR CANTIDADES
      if (connectivityStore.isOnline) {
        form.eliminados_detalles.push(id);
      } else if (form.sync_db) {
        form.eliminados_detalles.push(id);
      }
      //TODO: AGREGAR COL sync_db para saber si viene o no de la BD
    }
    form.proforma_detalles.splice(index, 1);

    recalcularCantidades();
  };

  const recalcularCantidades = () => {
    form.proforma_productos.forEach((item, index) => {
      getTotalColumna(index);
    });
  };

  const getTotalColumna = async (index_col) => {
    stockSuperado.value = false;
    form.proforma_productos[index_col].stock_actual =
      form.proforma_productos[index_col].stock_actual_aux;
    let total = 0;

    form.proforma_detalles.forEach((element) => {
      const cantidad = element.proforma_detalle_productos[index_col].cantidad;
      const resta = element.proforma_detalle_productos[index_col].resta;
      if (resta) {
        // existente
        if (cantidad && element.verificado == 0) {
          // total += parseFloat(cantidad) - parseFloat(resta);
          total += parseFloat(cantidad);
        } else {
          if (element.verificado == 0) total -= parseFloat(resta);
        }
      } else if (cantidad && element.verificado == 0) {
        total += parseFloat(cantidad ?? 0);
      }
    });

    const total_sucursal = form.proforma_productos[index_col].stock_actual;
    const nombre_producto = form.proforma_productos[index_col].producto.nombre;

    form.proforma_productos[index_col].stock_actual =
      parseFloat(total_sucursal) - parseFloat(total);

    form.proforma_productos[index_col].agregados = total;
    form.proforma_productos[index_col].suma = total_sucursal;
    if (total > total_sucursal) {
      toast.error(
        "Se supero el stock disponible del producto " + nombre_producto,
      );
      stockSuperado.value = true;
    }
    return total;
  };

  const cargarListas = () => {
    cargarSucursals();
    cargarUnidadMedidas();
  };

  const verificarProforma = async () => {
    await nextTick(async () => {
      if (form.id != 0) {
        form.proforma_productos.forEach((elem, col) => {
          obtenerStockProducto(elem.producto_id, col);
        });

        api.get("/admin/productos/listado").then((response) => {
          const data = response.data.productos;
          listProductos.value = data.map((producto) => ({
            value: producto.id,
            label: `${producto.codigo} | ${producto.nombre} ${producto.unidad_medida.nombre}`,
          }));
        });

        api.get("/admin/clientes/listado").then((response) => {
          const data = response.data.clientes;
          listClientes.value = data.map((cliente) => ({
            value: cliente.id,
            label: `${cliente.razon_social}`,
          }));
        });

        setTimeout(() => {
          actualizarStockAuxProductos();
        }, 500);
      }
      form.errors = null;
    });
  };

  const validarDetalles = () => {
    let error = true;
    form.proforma_detalles.forEach((item, index) => {
      if (!item.cliente_id) {
        toast.error(`No se agregó ningún cliente en la Fila ${index + 1}`);
        error = false;
      }
      if (!item.total) {
        toast.error(
          `No se detectó ningún producto agregado en la Fila ${index + 1}`,
        );
        error = false;
      }
    });
    enviando.value = false;

    return error;
  };

  // VERIFICAR CELDA
  const muestra_form_verifica = ref(false);
  const accion_form_verifica = ref(0);
  const oVerifica = ref(null);
  const filaVerifica = ref(-1);
  const colVerifica = ref(-1);

  const verificarCelda = (item, index, col) => {
    accion_form_verifica.value = 1;
    muestra_form_verifica.value = true;
    oVerifica.value = item;
    filaVerifica.value = index;
    colVerifica.value = col;
  };

  const detectaCierre = () => {
    muestra_form_verifica.value = false;
    oVerifica.value = null;
    filaVerifica.value = -1;
    colVerifica.value = -1;
  };

  const actualizaDetalleProducto = (verificado) => {
    form.proforma_detalles[filaVerifica.value].proforma_detalle_productos[
      colVerifica.value
    ].verificado = verificado;
    detectaCierre();
  };

  const generarOrdenVenta = (id, index) => {
    const sucursales = form.sucursal_ids;
    if (sucursales.length == 0) {
      toast.error(
        "Debe seleccionar al menos una sucursal para generar la Orden de Venta",
      );
      return;
    }

    // mostrar mensaje informando que se marcara como atendido y no se podra modificar
    Swal.fire({
      title: "Generar Orden de Venta",
      html: `<strong>Al generar la Orden de Venta, la Proforma se marcará como atendida y no podrá ser modificada. ¿Desea continuar?</strong>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, Generar Orden",
      cancelButtonText: "Cancelar",
      customClass: {
        confirmButton: "btn-success",
        cancelButton: "btn-danger",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        if (sucursales.length > 1) {
          // armar un select para seleccionar la sucursal para generar una orden de venta
          let options = "";
          sucursales.forEach((sucursal_id) => {
            const sucursal = listSucursals.value.find(
              (elem) => elem.id == sucursal_id,
            );
            if (sucursal) {
              options += `<option value="${sucursal.id}">${sucursal.nombre}</option>`;
            }
          });
          Swal.fire({
            title: "Seleccionar Sucursal",
            html: `
          <select id="sucursal_select" class="form-control" style="width: 100%;">
            ${options}
          </select>
        `,
            showCancelButton: true,
            confirmButtonText: "Generar Orden Venta",
            cancelButtonText: "Cancelar",
            preConfirm: () => {
              const sucursal_id =
                Swal.getPopup().querySelector("#sucursal_select").value;
              return sucursal_id;
            },
          }).then((result) => {
            if (result.isConfirmed) {
              const sucursal_id = result.value;
              // usar funcion crearOrdenVenta con sucursal_id
              crearOrdenVenta(id, index, sucursal_id);
            }
          });
        } else {
          // usar funcion crearOrdenVenta
          crearOrdenVenta(id, index, sucursales[0]);
        }
      }
    });
  };

  const crearOrdenVenta = (id, index, sucursal_id) => {
    api
      .post("/admin/proformas/crearOrdenVenta", {
        proforma_detalle_id: id,
        sucursal_id: sucursal_id,
      })
      .then((response) => {
        // redireccionar a la orden de venta editar
        router.push({
          name: "orden_ventas.edit",
          params: { id: response.data.orden_venta.id },
        });
      });
  };

  onUnmounted(() => {
    // document
    //   .getElementsByTagName("body")[0]
    //   .classList.remove("sidebar-collapse");
  });

  onMounted(() => {
    document.getElementsByTagName("body")[0].classList.add("sidebar-collapse");
    cargarListas();
    verificarProforma();
  });
</script>

<template>
  <div class="row">
    <div class="col-md-12">
      <div class="card">
        <div class="card-body">
          <div class="row">
            <div class="col-12" v-if="form.id != 0">
              <h4>{{ form.codigo }}</h4>
            </div>
            <div
              class="col-md-4 mb-0"
              v-if="!authStore?.user.sucursal_asignada"
            >
              <label>Seleccionar Sucursal</label>
              <el-select
                class="w-100"
                :class="{
                  'parsley-error': form.errors?.sucursal_id,
                }"
                v-model="form.sucursal_ids"
                filterable
                placeholder="Seleccione"
                no-data-text="Sin datos"
                no-match-text="No se encontró"
                @change="actualizarStockProductos"
                multiple
              >
                <el-option
                  v-for="item in listSucursals"
                  :key="item.id"
                  :value="item.id"
                  :label="item.nombre"
                ></el-option>
              </el-select>
              <ul
                v-if="form.errors?.sucursal_id"
                class="d-block text-danger mb-0 list-unstyled"
              >
                <li class="parsley-required">
                  {{ form.errors?.sucursal_id[0] }}
                </li>
              </ul>
            </div>
            <div class="col-md-4 mb-0" v-else>
              <b>Sucursal: </b>{{ authStore?.user.sucursal_asignada.nombre }}
            </div>
            <div class="col-md-4 mb-0">
              <label>Fecha</label>
              <input
                type="date"
                class="form-control"
                :class="{
                  'parsley-error': form.errors?.fecha,
                }"
                v-model="form.fecha"
                autosize
              />
              <ul
                v-if="form.errors?.fecha"
                class="d-block text-danger mb-0 list-unstyled"
              >
                <li class="parsley-required">
                  {{ form.errors?.fecha[0] }}
                </li>
              </ul>
            </div>
            <div class="col-md-4 mb-0">
              <label>Hora</label>
              <input
                type="time"
                class="form-control"
                :class="{
                  'parsley-error': form.errors?.hora,
                }"
                v-model="form.hora"
                autosize
              />
              <ul
                v-if="form.errors?.hora"
                class="d-block text-danger mb-0 list-unstyled"
              >
                <li class="parsley-required">
                  {{ form.errors?.hora[0] }}
                </li>
              </ul>
            </div>
            <div
              class="col-12 mt-2 overflow-auto"
              v-if="form.sucursal_ids.length > 0"
            >
              <table class="table table-bordered">
                <thead>
                  <tr class="bg8">
                    <th style="min-width: 180px">PRECIO</th>
                    <th></th>
                    <th></th>
                    <th
                      v-for="item in form.proforma_productos"
                      style="min-width: 180px"
                    >
                      {{ item.precio }}
                    </th>
                    <th rowspan="5" class="p-0">
                      <button
                        class="btn bg4 btn-sm h-100"
                        @click.prevent="agregarProducto"
                        style="writing-mode: vertical-rl; max-height: 220px"
                      >
                        + Nuevo Producto
                      </button>
                    </th>
                  </tr>
                  <tr class="bg6">
                    <th></th>
                    <th>Nro. Recibo</th>
                    <th>Total</th>
                    <th
                      v-for="(item, index_col) in form.proforma_productos"
                      class="p-0"
                    >
                      <button
                        class="btn btn-danger btn-sm text-xs"
                        @click="quitarProducto(item.id, index_col)"
                      >
                        X
                      </button>
                      <el-select-v2
                        v-model="item.producto_id"
                        filterable
                        @input="onInputSelectProductos"
                        @change="obtenerStockProducto($event, index_col)"
                        :reserve-keyword="false"
                        clearable
                        :options="listProductos"
                        :loading="loadingProductos"
                        placeholder="Producto..."
                        no-data-text="Sin resultados"
                        loading-text="Buscando..."
                      />
                    </th>
                  </tr>
                  <tr class="bg9">
                    <th>STOCK POR SUCURSAL</th>
                    <th></th>
                    <th></th>
                    <th
                      v-for="item in form.proforma_productos"
                      :class="{
                        'bg-danger': item.stock_actual < 0,
                      }"
                    >
                      <div
                        v-for="item_p_s in stockPorSucursales[item.producto_id]"
                      >
                        <span class="text-muted">{{ item_p_s.sucursal }}:</span>
                        {{ item_p_s.stock }}
                      </div>
                    </th>
                  </tr>
                  <tr class="bg9">
                    <th>
                      STOCK ACTUAL
                      <small class="text-muted">(DISPONIBLE)</small>
                    </th>
                    <th></th>
                    <th></th>
                    <th
                      v-for="item in form.proforma_productos"
                      :class="{
                        'bg-danger': item.stock_actual < 0,
                      }"
                    >
                      {{ item.stock_actual }}
                    </th>
                  </tr>
                  <tr class="bg7">
                    <th>PRODUCTOS AÑADIDOS</th>
                    <th></th>
                    <th></th>
                    <th
                      v-for="item in form.proforma_productos"
                      :class="{
                        'bg-danger': item.stock_actual < 0,
                      }"
                    >
                      {{ item.agregados }}
                    </th>
                  </tr>
                  <tr class="bg10">
                    <th>SUMA TOTAL</th>
                    <th></th>
                    <th></th>
                    <th
                      v-for="item in form.proforma_productos"
                      :class="{
                        'bg-danger': item.stock_actual < 0,
                      }"
                    >
                      {{ item.suma }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="form.proforma_detalles.length > 0">
                    <tr v-for="(item, index) in form.proforma_detalles">
                      <td class="p-0">
                        <el-select-v2
                          v-model="item.cliente_id"
                          filterable
                          @input="onInputSelectClientes"
                          @change="detectarCliente"
                          :reserve-keyword="false"
                          clearable
                          :options="listClientes"
                          :loading="loadingClientes"
                          placeholder="Razón Social..."
                          size="large"
                          no-data-text="Sin resultados"
                          loading-text="Buscando..."
                          class="rounded-0"
                        />
                      </td>
                      <td class="bg6 font-weight-bold text-center">
                        <small v-if="!item.id" class="text-muted"
                          >(automatico)</small
                        >
                        <span v-else v-text="item.id"></span>
                      </td>
                      <td class="bg6 font-weight-bold text-center">
                        {{ item.total }}
                      </td>
                      <td
                        v-for="(
                          item_detalle, col_index
                        ) in item.proforma_detalle_productos"
                        class="p-0"
                        :class="{
                          bg9: item_detalle.verificado == 1,
                        }"
                      >
                        <div
                          class="input-group"
                          v-if="item_detalle.verificado == 0"
                        >
                          <input
                            type="number"
                            class="form-control text-center"
                            min="1"
                            @keyup="actualizaStockProducto(col_index, index)"
                            @change="actualizaStockProducto(col_index, index)"
                            v-model="item_detalle.cantidad"
                          />
                          <div class="input-group-append">
                            <button
                              class="btn btn-xs bg4 text-success text-xs"
                              v-if="
                                item_detalle.id &&
                                item_detalle.id != 0 &&
                                item_detalle.cantidad
                              "
                              @click="
                                verificarCelda(item_detalle, index, col_index)
                              "
                            >
                              <i class="fa fa-check"></i>
                            </button>
                          </div>
                        </div>
                        <div
                          v-else
                          class="w-100 d-block h-100 text-center text-success font-weight-bold"
                        >
                          {{ item_detalle.cantidad }}
                        </div>
                      </td>
                      <td>
                        <button
                          v-if="form.id != 0 && item.verificado == 0"
                          class="btn btn-primary btn-sm"
                          title="Generar Orden Venta"
                          @click.prevent="generarOrdenVenta(item.id, index)"
                        >
                          <i class="fa fa-clipboard-list"></i>
                        </button>
                        <button
                          class="btn btn-danger btn-sm"
                          @click.prevent="quitarDetalle(item.id, index)"
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  </template>
                  <template v-else>
                    <tr>
                      <td
                        :colspan="form.proforma_productos.length + 5"
                        class="text-center font-weight-bold text-muted"
                      >
                        NO SE AGREGÓ NINGÚN CLIENTE
                      </td>
                    </tr>
                  </template>
                  <tr>
                    <td class="p-0">
                      <button
                        class="btn bg4 btn-sm w-100 rounded-0"
                        @click="agregarDetalle"
                      >
                        + Nuevo Cliente
                      </button>
                    </td>
                    <td :colspan="form.proforma_productos.length + 2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div
              class="col-12 border p-2 mt-2 text-center text-muted font-weight-bold"
              v-else
            >
              DEBES SELECCIONAR UNA SUCURSAL
            </div>
          </div>
          <div class="row" v-if="form.errors?.proforma_productos">
            <div class="col-12">
              <ul class="d-block text-danger mb-0 list-unstyled">
                <li class="parsley-required">
                  {{ form.errors?.proforma_productos[0] }}
                </li>
              </ul>
            </div>
          </div>
          <div class="row" v-if="form.errors?.proforma_detalles">
            <div class="col-12">
              <ul class="d-block text-danger mb-0 list-unstyled">
                <li class="parsley-required">
                  {{ form.errors?.proforma_detalles[0] }}
                </li>
              </ul>
            </div>
          </div>
          <div class="row" v-if="stockSuperado">
            <div class="alert alert-danger col-12">
              El stock de uno de los productos se supero
            </div>
          </div>
          <div
            class="row mt-2"
            v-if="!stockSuperado && form.proforma_detalles.length > 0"
          >
            <div class="col-md-4 offset-md-8">
              <button
                class="btn btn-primary w-100"
                v-html="textBtn"
                @click="enviarFormulario"
              ></button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <verifica
      :accion_formulario="accion_form_verifica"
      :muestra_formulario="muestra_form_verifica"
      :proforma_detalle_producto="oVerifica"
      @cerrar-formulario="detectaCierre"
      @envio-formulario="actualizaDetalleProducto"
    >
    </verifica>
  </div>
</template>

<style scoped>
  table {
    min-width: 900px;
  }
</style>
