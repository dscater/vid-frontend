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
    }
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

  const listProductos = ref([]);
  const cargarSucursalsProductos = () => {
    if (connectivityStore.isOnline) {
      api
        .get("/admin/sucursal_productos/listado", {
          params: {
            sucursal_id: form.sucursal_id,
          },
        })
        .then((response) => {
          listProductos.value = response.data.sucursal_productos;
        });
    } else {
      // OFFLINE
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

    if (query.length >= 2) {
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
              `?search=${encodeURIComponent(query)}`
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

  const agregarDetalle = () => {
    // preparar los productos
    let proforma_detalle_productos = [];
    listProductos.value.forEach((elem) => {
      proforma_detalle_productos.push({
        proforma_id: "",
        proforma_detalle_id: "",
        producto_id: elem.id,
        unidad_medida_id: elem.unidad_medida_id,
        unidad_medida: {
          id: elem.unidad_medida_id,
          nombre: elem.nombre_unidad,
        },
        cantidad: "",
        cantidad_entregada: "",
        precio: elem.precio,
        subtotal: "",
        verificado: 0,
      });
    });

    // agregar el detalle
    form.proforma_detalles.push({
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
  const actualizaStockProducto = (index_detalle, fila) => {
    getTotalColumna(index_detalle);
    sumaTotalPorFila(fila);
  };

  const sumaTotalPorFila = (fila) => {
    let total = 0;
    let total_cantidad = 0;
    console.log(fila);
    console.log(form.proforma_detalles);
    form.proforma_detalles[fila].proforma_detalle_productos.forEach(
      (elem_detalle, index_detalle) => {
        if (elem_detalle.cantidad) {
          total +=
            parseFloat(elem_detalle.cantidad) * parseFloat(elem_detalle.precio);
          total_cantidad += parseFloat(elem_detalle.cantidad);
          form.proforma_detalles[fila].proforma_detalle_productos[
            index_detalle
          ].subtotal =
            parseFloat(elem_detalle.cantidad) * parseFloat(elem_detalle.precio);
        }
      }
    );

    form.proforma_detalles[fila].total = total == 0 ? "" : total;
    form.proforma_detalles[fila].saldo = total == 0 ? "" : total;
    form.proforma_detalles[fila].cantidad =
      total_cantidad == 0 ? "" : total_cantidad;
  };

  const quitarDetalle = (id, index) => {
    if (id != 0) {
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
    listProductos.value.forEach((item, index) => {
      getTotalColumna(index);
    });
  };

  const getTotalColumna = (index_col) => {
    stockSuperado.value = false;

    listProductos.value[index_col].stock_actual =
      listProductos.value[index_col].stock_actual_aux;
    let total = 0;

    form.proforma_detalles.forEach((element) => {
      const cantidad = element.proforma_detalle_productos[index_col].cantidad;
      if (cantidad) {
        total += parseFloat(cantidad);
      }
    });

    const total_sucursal = listProductos.value[index_col].stock_actual;
    const nombre_producto = listProductos.value[index_col].nombre;

    listProductos.value[index_col].stock_actual =
      parseFloat(total_sucursal) - parseFloat(total);

    if (total > total_sucursal) {
      toast.error(
        "Se supero el stock disponible del producto " + nombre_producto
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
        await cargarSucursalsProductos();
        setTimeout(() => {
          recalcularCantidades();
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
          `No se detectó ningún producto agregado en la Fila ${index + 1}`
        );
        error = false;
      }
    });
    enviando.value = false;

    return error;
  };

  onUnmounted(() => {});

  onMounted(() => {
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
                v-model="form.sucursal_id"
                filterable
                placeholder="Seleccione"
                no-data-text="Sin datos"
                no-match-text="No se encontró"
                @change="cargarSucursalsProductos"
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
            <div class="col-12 mt-2 overflow-auto" v-if="form.sucursal_id">
              <table class="table table-bordered">
                <thead>
                  <tr>
                    <th>PRECIO</th>
                    <th></th>
                    <th></th>
                    <th v-for="item in listProductos">
                      {{ item.precio }}
                    </th>
                    <th colspan="2" rowspan="3"></th>
                  </tr>
                  <tr>
                    <th></th>
                    <th>Nro. Recibo</th>
                    <th>Total</th>
                    <th v-for="item in listProductos">
                      {{ item.nombre }}<br />
                      {{ item.nombre_unidad }}
                    </th>
                  </tr>
                  <tr>
                    <th>STOCK ACTUAL</th>
                    <th></th>
                    <th></th>
                    <th
                      v-for="item in listProductos"
                      :class="{
                        'bg-danger': item.stock_actual < 0,
                      }"
                    >
                      {{ item.stock_actual }}
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
                      <td>
                        <small v-if="!item.id" class="text-muted"
                          >(automatico)</small
                        >
                        <span v-else v-text="item.id"></span>
                      </td>
                      <td>{{ item.total }}</td>
                      <td
                        v-for="(
                          item_detalle, index_detalle
                        ) in item.proforma_detalle_productos"
                        class="p-0"
                      >
                        <input
                          type="number"
                          class="form-control"
                          min="1"
                          @keyup="actualizaStockProducto(index_detalle, index)"
                          v-model="item_detalle.cantidad"
                        />
                      </td>
                      <td>
                        <button
                          class="btn btn-danger btn-sm"
                          @click.prevent="quitarDetalle(item, index)"
                        >
                          <i class="fa fa-times"></i>
                        </button>
                      </td>
                      <td>
                        <button
                          class="btn btn-warning btn-sm"
                          v-if="form.id != 0"
                        >
                          <i class="fa fa-sync"></i>
                        </button>
                      </td>
                    </tr>
                  </template>
                  <template v-else>
                    <tr>
                      <td
                        :colspan="listProductos.length + 3"
                        class="text-center font-weight-bold text-muted"
                      >
                        NO SE AGREGÓ NINGÚN CLIENTE
                      </td>
                    </tr>
                  </template>
                  <tr>
                    <td class="p-0">
                      <button
                        class="btn btn-primary btn-sm w-100 rounded-0"
                        @click="agregarDetalle"
                      >
                        + Nuevo Cliente
                      </button>
                    </td>
                    <td :colspan="listProductos.length + 2"></td>
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
  </div>
</template>

<style scoped>
  table {
    min-width: 900px;
  }
</style>
