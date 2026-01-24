<script setup>
  import MiModal from "../../../Components/MiModal.vue";
  import { useSolicitudIngresos } from "../../../composables/solicitud_ingresos/useSolicitudIngresos";
  import { watch, ref, computed, onMounted, nextTick, reactive } from "vue";
  import api from "../../../composables/axios.js";
  import { useAuthStore } from "../../../stores/authStore";
  const authStore = useAuthStore();

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

  const { oSolicitudIngreso, limpiarSolicitudIngreso } = useSolicitudIngresos();
  const accion_form = ref(props.accion_formulario);
  const muestra_form = ref(props.muestra_formulario);
  const enviando = ref(false);
  let form = reactive(oSolicitudIngreso.value);
  watch(
    () => props.muestra_formulario,
    (newValue) => {
      muestra_form.value = newValue;
      if (muestra_form.value) {
        cargarListas();
        document.getElementsByTagName("body")[0].classList.add("modal-open");
        form = oSolicitudIngreso.value;
        form.errors = null;
      } else {
        document.getElementsByTagName("body")[0].classList.remove("modal-open");
      }
    },
  );
  watch(
    () => props.accion_formulario,
    (newValue) => {
      accion_form.value = newValue;
      if (accion_form.value == 0) {
        form["_method"] = "POST";
      }
    },
  );

  const tituloDialog = computed(() => {
    return accion_form.value == 0
      ? `<i class="fa fa-minus"></i> Detalles`
      : `<i class="fa fa-list"></i> Ver Detalles Solicitud de Ingreso`;
  });

  const verificarObservaciones = () => {
    let obs = 0;
    form.solicitud_ingreso_detalles.forEach((item, index) => {
      if (item.cantidad != item.cantidad_fisica) {
        obs = 1;
      }
    });

    if (obs == 0) {
      form.verificado = 1;
    } else {
      form.verificado = 2;
    }
  };

  const textBtn = computed(() => {
    if (enviando.value) {
      return `<i class="fa fa-spin fa-spinner"></i> Enviando...`;
    }
    if (accion_form.value == 0) {
      return `<i class="fa fa-save"></i> Guardar`;
    }

    if (form.verificado == 2) {
      return `<i class="fa fa-check"></i> Aprobado con observaciones`;
    } else {
      return `<i class="fa fa-check"></i> Aprobar`;
    }
  });

  const textBtn2 = computed(() => {
    if (enviando.value) {
      return `<i class="fa fa-spin fa-spinner"></i> Enviando...`;
    }
    if (accion_form.value == 0) {
      return `<i class="fa fa-save"></i> Guardar`;
    }

    return `<i class="fa fa-check"></i> Aprobar Costos`;
  });

  const enviarFormulario = () => {
    verificarObservaciones();
    enviando.value = true;
    let url =
      accion_form.value == 0
        ? "/admin/solicitud_ingresos"
        : "/admin/solicitud_ingresos/aprobar/" + form.id;

    api
      .post(url, form)
      .then((response) => {
        // console.log(response);

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
        limpiarSolicitudIngreso();
        emits("envio-formulario");
      })
      .catch((error) => {
        if (
          error.response &&
          error.response.data &&
          error.response.data.errors
        ) {
          const msgError =
            "Existen errores en el formulario, por favor verifique";
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

  const enviarFormulario2 = () => {
    verificarObservaciones();
    enviando.value = true;
    let url =
      accion_form.value == 0
        ? "/admin/solicitud_ingresos"
        : "/admin/solicitud_ingresos/aprobar_costos/" + form.id;

    api
      .post(url, form)
      .then((response) => {
        // console.log(response);

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
        limpiarSolicitudIngreso();
        emits("envio-formulario");
      })
      .catch((error) => {
        if (
          error.response &&
          error.response.data &&
          error.response.data.errors
        ) {
          const msgError =
            "Existen errores en el formulario, por favor verifique";
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

  const listMotivos = ref([
    "MERMA",
    "ROTURA",
    "ROBO",
    "AJUSTE",
    "POR CONTEO",
    "POR FALTANTE DE PROVEEDOR",
    "CONFUSIÓN DE PRODUCTOS ENTREGADOS(NO REPUESTO)",
  ]);

  const listSucursals = ref([]);
  const cargarSucursals = () => {
    api
      .get("/admin/sucursals/listado", {
        params: {
          estado: 1,
        },
      })
      .then((response) => {
        listSucursals.value = response.data.sucursals;
      });
  };

  const cargarListas = () => {
    cargarSucursals();
  };

  const calcularSubtotalByCosto = (e, index) => {
    const elem = e.target;
    const value = elem.value;
    if (!value || value.trim() == "") {
      form.solicitud_ingreso_detalles[index].subtotal =
        form.solicitud_ingreso_detalles[index].costo;
    }
    form.solicitud_ingreso_detalles[index].subtotal =
      parseFloat(value) *
      parseFloat(form.solicitud_ingreso_detalles[index].cantidad);
    calcularTotal();
  };

  const calcularSubtotal = (e, index) => {
    const elem = e.target;
    const value = elem.value;
    if (!value || value.trim() == "") {
      form.solicitud_ingreso_detalles[index].subtotal =
        form.solicitud_ingreso_detalles[index].costo;
    }
    form.solicitud_ingreso_detalles[index].subtotal =
      parseFloat(value) *
      parseFloat(form.solicitud_ingreso_detalles[index].costo);
    calcularTotal();
  };

  const calcularTotal = () => {
    if (form.solicitud_ingreso_detalles.length == 0) {
      form.total = 0;
      form.cantidad_total = 0;
      return;
    }
    let total = 0;
    total = form.solicitud_ingreso_detalles.reduce((acum, item) => {
      return acum + parseFloat(item.subtotal);
    }, 0);
    form.total = total;
    total = form.solicitud_ingreso_detalles.reduce((acum, item) => {
      return acum + parseFloat(item.cantidad);
    }, 0);
    form.cantidad_total = total;
  };

  const getCantidadRepuesta = (a, b) => {
    return parseInt(a) - parseInt(b);
  };

  onMounted(() => {});
</script>

<template>
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
        <div class="row">
          <div class="col-12">
            <h4>{{ form.codigo }}</h4>
          </div>
        </div>
        <div class="row mb-2">
          <div class="col-md-4">
            <label>Proveedor: </label>
            {{ form.proveedor?.razon_social }}
          </div>
          <div class="col-md-4">
            <label>Fecha de Ingreso: </label>
            {{ form.fecha_ingreso_t }}
          </div>
          <div class="col-md-4">
            <label>Hora de Ingreso: </label>
            {{ form.hora_ingreso }}
          </div>
          <!-- <div class="col-md-4">
            <label>Con Factura/Sin Factura: </label>
            {{ form.cs_f }}
          </div>
          <div class="col-md-4">
            <label>Tipo de Cambio: </label>
            {{ form.tipo_cambio }}
          </div>
          <div class="col-md-4">
            <label>Gastos adicionales: </label>
            {{ form.gastos }}
          </div> -->
          <div class="col-md-4">
            <label>Obsrevaciones: </label>
            {{ form.observaciones }}
          </div>
          <div class="col-md-4">
            <label>Descripción: </label>
            {{ form.descripcion }}
          </div>
          <div
            class="col-12"
            v-if="form.verificado > 0 && form.estado != 'PENDIENTE'"
          >
            <div class="row mt-2">
              <div class="col-md-4 mb-2">
                <label class="required">Con factura/Sin factura*</label>
                <select
                  class="form-control"
                  :class="{
                    'parsley-error': form.errors?.cs_f,
                  }"
                  v-model="form.cs_f"
                >
                  <option value="CON FATURA">CON FACTURA</option>
                  <option value="SIN FATURA">SIN FACTURA</option>
                </select>
                <ul
                  v-if="form.errors?.cs_f"
                  class="d-block text-danger list-unstyled"
                >
                  <li class="parsley-required">
                    {{ form.errors?.cs_f[0] }}
                  </li>
                </ul>
              </div>
              <div class="col-md-4 mb-2">
                <label class="required">Tipo de Cambio</label>
                <input
                  type="number"
                  class="form-control"
                  step="0.01"
                  :class="{
                    'parsley-error': form.errors?.tipo_cambio,
                  }"
                  v-model="form.tipo_cambio"
                  autosize
                />
                <ul
                  v-if="form.errors?.tipo_cambio"
                  class="d-block text-danger list-unstyled"
                >
                  <li class="parsley-required">
                    {{ form.errors?.tipo_cambio[0] }}
                  </li>
                </ul>
              </div>
              <div class="col-md-4 mb-2">
                <label class="required">Gastos adicionales</label>
                <input
                  type="number"
                  class="form-control"
                  step="0.01"
                  :class="{
                    'parsley-error': form.errors?.gastos,
                  }"
                  v-model="form.gastos"
                  autosize
                />
                <ul
                  v-if="form.errors?.gastos"
                  class="d-block text-danger list-unstyled"
                >
                  <li class="parsley-required">
                    {{ form.errors?.gastos[0] }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-12 overflow-auto">
            <table class="table table-bordered mb-0">
              <thead class="bg-secundario">
                <tr>
                  <th width="1%">NRO.</th>
                  <th width="90px">CÓDIGO</th>
                  <th>PRODUCTO</th>
                  <th width="60px">CANTIDAD</th>
                  <th width="60px">CANTIDAD FÍSICA</th>
                  <th
                    width="145px"
                    v-if="form.verificado > 0 && form.estado != 'PENDIENTE'"
                  >
                    PRECIO COMPRA
                  </th>
                  <th
                    width="145px"
                    v-if="form.verificado > 0 && form.estado != 'PENDIENTE'"
                  >
                    PRECIO FACTURADO
                  </th>
                  <th
                    width="100px"
                    v-if="form.verificado > 0 && form.estado != 'PENDIENTE'"
                  >
                    SUBTOTAL
                  </th>
                  <th width="200px">VERIFICAR</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="form.solicitud_ingreso_detalles.length > 0">
                  <tr v-for="(item, index) in form.solicitud_ingreso_detalles">
                    <td>{{ index + 1 }}</td>
                    <td>{{ item.producto.codigo }}</td>
                    <td>{{ item.producto.nombre }}</td>
                    <td>
                      {{ item.cantidad }}
                    </td>
                    <td>
                      <template v-if="form.verificado < 3">
                        <input
                          type="number"
                          step="1"
                          min="1"
                          class="form-control"
                          v-model="item.cantidad_fisica"
                          @change="verificarObservaciones"
                          @keyup="verificarObservaciones"
                        />
                      </template>
                      <template v-else>
                        {{ item.cantidad_fisica }}
                      </template>
                    </td>
                    <td
                      v-if="form.verificado > 0 && form.estado != 'PENDIENTE'"
                    >
                      <template
                        v-if="form.verificado == 1 || form.verificado == 2"
                      >
                        <div class="input-group">
                          <input
                            type="number"
                            step="1"
                            min="1"
                            class="form-control"
                            v-model="item.costo"
                            @change="calcularSubtotalByCosto($event, index)"
                            @keyup="calcularSubtotalByCosto($event, index)"
                          />
                          <div
                            class="input-group-text rounded-0 text-xs text-muted font-weight-bold px-1"
                          >
                            Bs
                          </div>
                        </div>
                      </template>
                      <template v-else> {{ item.costo }} Bs </template>
                    </td>
                    <td
                      v-if="form.verificado > 0 && form.estado != 'PENDIENTE'"
                    >
                      <template
                        v-if="form.verificado == 1 || form.verificado == 2"
                      >
                        <div class="input-group">
                          <input
                            type="number"
                            step="1"
                            min="1"
                            class="form-control"
                            v-model="item.costo_facturado"
                          />
                          <div
                            class="input-group-text rounded-0 text-xs text-muted font-weight-bold px-1"
                          >
                            Bs
                          </div>
                        </div>
                      </template>
                      <template v-else>
                        {{ item.costo_facturado }} Bs
                      </template>
                    </td>
                    <td
                      v-if="form.verificado > 0 && form.estado != 'PENDIENTE'"
                    >
                      {{ item.subtotal }} Bs
                    </td>
                    <td>
                      <template
                        v-if="
                          form.verificado == 0 || form.estado == 'PENDIENTE'
                        "
                      >
                        <el-checkbox
                          :true-value="1"
                          :false-value="0"
                          v-model="item.verificado"
                          size="large"
                          class="verificaCheckbox"
                        >
                          Verificar
                        </el-checkbox>
                        <template v-if="item.cantidad != item.cantidad_fisica">
                          <!-- <el-select
                            class="w-100 mb-2"
                            v-model="item.sucursal_ajuste"
                            filterable
                            placeholder="Selecionar Sucursal"
                            no-data-text="Sin datos"
                            no-match-text="Sin datos"
                            clearable
                          >
                            <el-option
                              v-for="item in listSucursals"
                              :key="item.id"
                              :value="item.id"
                              :label="item.nombre"
                            ></el-option>
                          </el-select> -->
                          <div>
                            Cantidad repuesta:
                            {{
                              getCantidadRepuesta(
                                item.cantidad,
                                item.cantidad_fisica,
                              )
                            }}
                          </div>
                          <el-select
                            class="w-100"
                            v-model="item.motivo"
                            filterable
                            placeholder="Selecione Motivo"
                            no-data-text="Sin datos"
                            no-match-text="Sin datos"
                            clearable
                          >
                            <el-option
                              v-for="(item, index) in listMotivos"
                              :key="index"
                              :value="item"
                              :label="item"
                            ></el-option>
                          </el-select>
                        </template>
                      </template>
                      <template v-else>
                        VERIFICADO
                        <div v-if="item.motivo" class="text-muted border-top">
                          <div>
                            Cantidad repuesta:
                            {{
                              getCantidadRepuesta(
                                item.cantidad,
                                item.cantidad_fisica,
                              )
                            }}
                          </div>
                          <!-- {{ item.motivo.nombre }}<br /> -->
                          {{ item.motivo }}
                        </div>
                      </template>
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
              </tbody>
            </table>
            <ul
              v-if="form.errors?.solicitud_ingreso_detalles"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.solicitud_ingreso_detalles[0] }}
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
        v-if="
          (form.verificado == 0 || form.estado == 'PENDIENTE') &&
          (authStore?.user?.permisos == '*' ||
            authStore?.user?.permisos.includes('solicitud_ingresos.aprobar'))
        "
        type="button"
        class="btn btn-success"
        :disabled="enviando"
        @click.prevent="enviarFormulario"
        v-html="textBtn"
      ></button>
      <button
        v-if="
          form.estado != 'PENDIENTE' &&
          (form.verificado == 1 || form.verificado == 2) &&
          (authStore?.user?.permisos == '*' ||
            authStore?.user?.permisos.includes(
              'solicitud_ingresos.aprobar_costos',
            ))
        "
        type="button"
        class="btn btn-success"
        :disabled="enviando"
        @click.prevent="enviarFormulario2"
        v-html="textBtn2"
      ></button>
    </template>
  </MiModal>
</template>
