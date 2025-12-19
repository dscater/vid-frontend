<script setup>
  import MiModal from "../../../Components/MiModal.vue";
  import { useOrdenSalidas } from "../../../composables/orden_salidas/useOrdenSalidas";
  import { watch, ref, computed, onMounted, nextTick, reactive } from "vue";
  import api from "../../../composables/axios.js";
  import Calculator from "./Calculator.vue";
  // TOAST
  import { toast } from "vue3-toastify";
  import "vue3-toastify/dist/index.css";
  const props = defineProps({
    muestra_formulario: {
      type: Boolean,
      default: false,
    },
    accion_formulario: {
      type: Number,
      default: 0,
    },
  });

  const { oOrdenSalida, limpiarOrdenSalida } = useOrdenSalidas();
  const accion_form = ref(props.accion_formulario);
  const muestra_form = ref(props.muestra_formulario);
  const enviando = ref(false);
  let form = reactive(oOrdenSalida.value);
  const codigoProducto = ref("");
  watch(
    () => props.muestra_formulario,
    (newValue) => {
      muestra_form.value = newValue;
      if (muestra_form.value) {
        cargarListas();
        document.getElementsByTagName("body")[0].classList.add("modal-open");
        form = oOrdenSalida.value;
        if (accion_form.value == 0 || form.id == 0) {
          form.fecha_ingreso = getFechaAtual();
          form.hora_ingreso = getHoraActual();
        }
        form.errors = null;
      } else {
        document.getElementsByTagName("body")[0].classList.remove("modal-open");
      }
    }
  );
  watch(
    () => props.accion_formulario,
    (newValue) => {
      accion_form.value = newValue;
      if (accion_form.value == 0) {
        form["_method"] = "POST";
      }
    }
  );

  const tituloDialog = computed(() => {
    return accion_form.value == 0
      ? `<i class="fa fa-plus"></i> Nueva Orden de Salida`
      : `<i class="fa fa-edit"></i> Editar Orden de Salida`;
  });

  const textBtn = computed(() => {
    if (enviando.value) {
      return `<i class="fa fa-spin fa-spinner"></i> Enviando...`;
    }
    if (accion_form.value == 0) {
      return `<i class="fa fa-save"></i> Guardar`;
    }
    return `<i class="fa fa-edit"></i> Actualizar`;
  });

  const enviarFormulario = () => {
    enviando.value = true;
    let url =
      accion_form.value == 0
        ? "/admin/orden_salidas"
        : "/admin/orden_salidas/" + form.id;

    api
      .post(url, form)
      .then((response) => {
        console.log(response);

        const success = response.data.message ?? "Proceso realizado con éxito";
        Swal.fire({
          icon: "success",
          title: "Correcto",
          html: `<strong>${success}</strong>`,
          confirmButtonText: `Aceptar`,
          customClass: {
            confirmButton: "btn-success",
          },
        });
        limpiarOrdenSalida();
        emits("envio-formulario");
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
  };

  const emits = defineEmits(["cerrar-formulario", "envio-formulario"]);

  watch(muestra_form, (newVal) => {
    if (!newVal) {
      emits("cerrar-formulario");
    }
  });

  const cerrarFormulario = () => {
    muestra_form.value = false;
    document.getElementsByTagName("body")[0].classList.remove("modal-open");
  };

  const listSucursals = ref([]);
  const cargarProveedors = () => {
    api.get("/admin/sucursals/listadoSP").then((response) => {
      listSucursals.value = response.data.sucursals;
    });
  };

  const listUsers = ref([]);
  const cargarUsers = () => {
    api.get("/admin/usuarios/listado").then((response) => {
      listUsers.value = response.data.usuarios;
    });
  };

  const cargarListas = () => {
    cargarProveedors();
    cargarUsers();
  };

  const getFechaAtual = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getHoraActual = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const agregarProducto = () => {
    if (codigoProducto.value.trim() == "") {
      Swal.fire({
        icon: "info",
        title: "Atención",
        html: `<strong>No se encontró ningún producto con el código ingresado</strong>`,
        confirmButtonText: `Aceptar`,
        customClass: {
          confirmButton: "btn-success",
        },
      });
      return;
    }

    api
      .get("/admin/productos/byCodigo", {
        params: {
          codigo: codigoProducto.value,
        },
      })
      .then((response) => {
        if (!response.data) {
          Swal.fire({
            icon: "info",
            title: "Atención",
            html: `<strong>No se encontró ningún producto con el código ingresado</strong>`,
            confirmButtonText: `Aceptar`,
            customClass: {
              confirmButton: "btn-success",
            },
          });
          return;
        }
        const prod = response.data;
        const existe = form.orden_salida_detalles.filter(
          (elem) => elem.producto_id === prod.id
        );
        if (existe.length > 0) {
          toast.info("Ese producto ya fue agregado");
          return;
        }

        form.orden_salida_detalles.push({
          id: 0,
          orden_salida_id: 0,
          producto_id: prod.id,
          producto: prod,
          cantidad: 1,
          costo: prod.precio,
          subtotal: prod.precio,
        });
        codigoProducto.value = "";
        calcularTotal();
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          icon: "info",
          title: "Atención",
          html: `<strong>Ocurrió un error al intentar obtener el registro</strong>`,
          confirmButtonText: `Aceptar`,
          customClass: {
            confirmButton: "btn-success",
          },
        });
      });
  };

  const oUser = ref(null);
  const getUsuarioSolicitante = () => {
    oUser.value = null;
    if (form.sucursal_id) {
      const user_id = listSucursals.value.filter(
        (elem) => elem.id === form.sucursal_id
      )[0].user_id;

      api.get("/admin/usuarios/show/" + user_id).then((response) => {
        oUser.value = response.data;
        form.user_ap = oUser.value.id;
      });
    }
  };

  const calcularSubtotal = (e, index) => {
    const elem = e.target;
    const value = elem.value;
    if (!value || value.trim() == "") {
      form.orden_salida_detalles[index].subtotal =
        form.orden_salida_detalles[index].costo;
    }
    form.orden_salida_detalles[index].subtotal =
      parseFloat(value) * parseFloat(form.orden_salida_detalles[index].costo);
    calcularTotal();
  };
  const calcularSubtotalIndex = (index) => {
    const value = form.orden_salida_detalles[index].cantidad;
    if (!value) {
      form.orden_salida_detalles[index].subtotal =
        form.orden_salida_detalles[index].costo;
    }
    form.orden_salida_detalles[index].subtotal =
      parseFloat(value) * parseFloat(form.orden_salida_detalles[index].costo);
    calcularTotal();
  };

  const calcularTotal = () => {
    if (form.orden_salida_detalles.length == 0) {
      form.total = 0;
      form.cantidad_total = 0;
      return;
    }
    let total = 0;
    total = form.orden_salida_detalles.reduce((acum, item) => {
      return acum + parseFloat(item.subtotal);
    }, 0);
    form.total = total;
    total = form.orden_salida_detalles.reduce((acum, item) => {
      return acum + parseFloat(item.cantidad);
    }, 0);
    form.cantidad_total = total;
  };

  const eliminarDetalle = (index, id) => {
    if (id != 0) {
      form.eliminados_detalles.push(id);
    }
    form.orden_salida_detalles.splice(index, 1);
    calcularTotal();
  };

  const indexDetalle = ref(-1);
  const showCalc = ref(false);
  const muestraCalculadora = (index) => {
    indexDetalle.value = index;
    showCalc.value = true;
  };
  function guardarResultado({ index, value }) {
    form.orden_salida_detalles[index].cantidad = value;
    calcularSubtotalIndex(index);
    showCalc.value = false;
  }

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

    if (query.length >= 2) {
      clearInterval(intervalProductos.value);
      intervalProductos.value = setTimeout(() => {
        remoteMethodProductos(query);
      }, 400);
    }
  };
  const remoteMethodProductos = async (query) => {
    if (!query || query.length < 2) {
      return;
    }
    loadingProductos.value = true;
    try {
      let response = null;
      response = await api.get(
        "/admin/productos/byCodigoListSelectElementUi" +
          `?search=${encodeURIComponent(query)}`
      );
      const data = response ? response.data.productos : [];
      // Suponiendo que data es un array de productos [{id, nombre}]
      listProductos.value = data.map((producto) => ({
        value: producto.codigo,
        // label: `${producto.codigo} - ${producto.ci}`,
        label: `${producto.codigo}`,
      }));
    } catch (error) {
      console.log(error);
      listProductos.value = [];
    } finally {
      loadingProductos.value = false;
    }
  };

  onMounted(() => {});
</script>

<template>
  <div>
    <MiModal
      :open_modal="muestra_form"
      @close="cerrarFormulario"
      :size="'modal-full'"
      :header-class="'bg-navy'"
      :footer-class="'justify-content-end'"
    >
      <template #header>
        <h4 class="modal-title text-white" v-html="tituloDialog"></h4>
        <button type="button" class="close" @click.prevent="cerrarFormulario()">
          <span aria-hidden="true">×</span>
        </button>
      </template>

      <template #body>
        <form @submit.prevent="enviarFormulario()">
          <p class="text-muted text-xs mb-0">
            Todos los campos con
            <span class="text-danger">(*)</span> son obligatorios.
          </p>
          <div class="row">
            <div class="col-md-4 mb-2">
              <label class="required">Seleccionar Sucursal</label>
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
                @change="getUsuarioSolicitante"
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
                class="d-block text-danger list-unstyled"
              >
                <li class="parsley-required">
                  {{ form.errors?.sucursal_id[0] }}
                </li>
              </ul>
            </div>
            <div class="col-md-4 mb-2">
              <label class="required">Usuario que solicita</label>
              <el-select
                class="w-100"
                :class="{
                  'parsley-error': form.errors?.user_sol,
                }"
                v-model="form.user_sol"
                filterable
                placeholder="Seleccione"
                no-data-text="Sin datos"
                no-match-text="No se encontró"
              >
                <el-option
                  v-for="item in listUsers"
                  :key="item.id"
                  :value="item.id"
                  :label="`${item.nombre} ${item.paterno} ${item.materno}`"
                ></el-option>
              </el-select>
              <ul
                v-if="form.errors?.user_sol"
                class="d-block text-danger list-unstyled"
              >
                <li class="parsley-required">
                  {{ form.errors?.user_sol[0] }}
                </li>
              </ul>
            </div>
            <div class="col-md-4 mb-2">
              <label class="required">Usuario aprobador</label>
              <input
                type="text"
                class="form-control"
                :value="`${oUser ? oUser.full_name : ''}`"
                readonly
              />
              <ul
                v-if="form.errors?.user_ap"
                class="d-block text-danger list-unstyled"
              >
                <li class="parsley-required">
                  {{ form.errors?.user_ap[0] }}
                </li>
              </ul>
            </div>
            <div class="col-md-4 mb-2">
              <label>Observaciones</label>
              <el-input
                type="textarea"
                :class="{
                  'parsley-error': form.errors?.observaciones,
                }"
                v-model="form.observaciones"
                autosize
              ></el-input>
              <ul
                v-if="form.errors?.observaciones"
                class="d-block text-danger list-unstyled"
              >
                <li class="parsley-required">
                  {{ form.errors?.observaciones[0] }}
                </li>
              </ul>
            </div>
          </div>
          <div class="row">
            <div class="col-12">
              <h4>Seleccionar Productos</h4>
            </div>
            <div class="col-md-6 mb-2">
              <small class="text-muted font-weight-bold"
                >Código de Producto</small
              >
              <div class="input-group">
                <el-select-v2
                  v-model="codigoProducto"
                  filterable
                  @input="onInputSelectProductos"
                  :reserve-keyword="false"
                  clearable
                  :options="listProductos"
                  :loading="loadingProductos"
                  placeholder="Código..."
                  size="large"
                  no-data-text="Sin resultados"
                  loading-text="Buscando..."
                  class="rounded-0"
                  style="width: calc(100% - 38px)"
                />
                <div class="input-group-append">
                  <button
                    class="btn btn-primary d-flex align-items-center justify-content-center"
                    @click.prevent="agregarProducto"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <div class="col-12 overflow-auto">
              <table class="table table-bordered mb-0">
                <thead class="bg-secundario">
                  <tr>
                    <th>PRODUCTO</th>
                    <th width="100px">C/U</th>
                    <th width="180px">CANTIDAD</th>
                    <th width="100px">SUBTOTAL</th>
                    <th width="1%"></th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="form.orden_salida_detalles.length > 0">
                    <tr v-for="(item, index) in form.orden_salida_detalles">
                      <td>{{ item.producto.nombre }}</td>
                      <td>{{ item.costo }}</td>
                      <td>
                        <div class="input-group">
                          <input
                            type="number"
                            step="1"
                            min="1"
                            class="form-control"
                            v-model="item.cantidad"
                            @change="calcularSubtotal($event, index)"
                            @keyup="calcularSubtotal($event, index)"
                          />
                          <div class="input-group-append">
                            <button
                              class="btn btn-sm"
                              @click.prevent="muestraCalculadora(index)"
                            >
                              <i class="fa fa-calculator"></i>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td>{{ item.subtotal }}</td>
                      <td>
                        <button
                          class="btn btn-danger btn-sm"
                          @click.prevent="eliminarDetalle(index, item.id)"
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  </template>
                  <template v-else>
                    <tr>
                      <td colspan="4" class="text-muted text-sm text-center">
                        NO SE AGREGARÓN PRODUCTOS
                      </td>
                    </tr>
                  </template>
                  <tr>
                    <td class="font-weight-bold text-right" colspan="2">
                      TOTALES
                    </td>
                    <td>{{ form.cantidad_total }}</td>
                    <td>{{ form.total }}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
              <ul
                v-if="form.errors?.orden_salida_detalles"
                class="d-block text-danger list-unstyled"
              >
                <li class="parsley-required">
                  {{ form.errors?.orden_salida_detalles[0] }}
                </li>
              </ul>
            </div>
          </div>
        </form>
      </template>
      <template #footer>
        <button
          type="button"
          class="btn btn-default"
          @click.prevent="cerrarFormulario()"
        >
          Cerrar
        </button>
        <button
          type="button"
          class="btn btn-success"
          :disabled="enviando"
          @click.prevent="enviarFormulario"
          v-html="textBtn"
        ></button>
      </template>
    </MiModal>
    <Calculator
      :show="showCalc"
      :index="indexDetalle"
      @accept="guardarResultado"
      @close="showCalc = false"
    ></Calculator>
  </div>
</template>
