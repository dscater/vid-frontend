<script setup>
  import MiModal from "../../../Components/MiModal.vue";
  import { useCuentaCobrars } from "../../../composables/cuenta_cobrars/useCuentaCobrars";
  import { watch, ref, computed, onMounted, nextTick, reactive } from "vue";
  import api from "../../../composables/axios.js";
  import { useAuthStore } from "../../../stores/authStore";
  import { useCuentaCobrarStore } from "../../../stores/offlineStores/cuentaCobrarStore.js";
  import { useConnectivityStore } from "../../../stores/offlineStores/useConnectivityStore";
  import { useFormater } from "../../../composables/useFormater";
  const { getFormatoMoneda } = useFormater();
  const connectivityStore = useConnectivityStore();
  const cuentaCobrarStore = useCuentaCobrarStore();
  const authStore = useAuthStore();
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

  const { oCuentaCobrar, limpiarCuentaCobrar } = useCuentaCobrars();
  const accion_form = ref(props.accion_formulario);
  const muestra_form = ref(props.muestra_formulario);
  const enviando = ref(false);
  let form = reactive(oCuentaCobrar.value);
  const errors = ref(null);
  const montoPago = ref(0);
  watch(
    () => props.muestra_formulario,
    (newValue) => {
      muestra_form.value = newValue;
      if (muestra_form.value) {
        document.getElementsByTagName("body")[0].classList.add("modal-open");
        form = oCuentaCobrar.value;
        oldCancelado.value = form.cancelado;
        errors.value = null;
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
      ? `<i class="fa fa-plus"></i> Nuevo CuentaCobrar`
      : `<i class="fa fa-edit"></i> Agregar Pago Cuenta por Cobrar`;
  });

  const textBtn = computed(() => {
    if (enviando.value) {
      return `<i class="fa fa-spin fa-spinner"></i> Enviando...`;
    }
    if (accion_form.value == 0) {
      return `<i class="fa fa-save"></i> Guardar`;
    }
    return `<i class="fa fa-hand-holding-usd"></i> Registrar Pago`;
  });

  const enviarFormulario = async () => {
    if (!verificarSaldoMonto()) {
      Swal.fire({
        icon: "info",
        title: "Error",
        html: `<strong>El monto no puede superar al saldo y tampoco puede ser 0</strong>`,
        confirmButtonText: `Aceptar`,
        customClass: {
          confirmButton: "btn-error",
        },
      });
      return;
    }
    enviando.value = true;
    if (connectivityStore.isOnline) {
      let url =
        accion_form.value == 0
          ? "/admin/cuenta_cobrars"
          : "/admin/cuenta_cobrars/pago/" + form.id;

      api
        .post(url, {
          cancelado: montoPago.value,
          _method: "PUT",
        })
        .then((response) => {
          console.log(response);
          montoPago.value = 0;
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
          limpiarCuentaCobrar();
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
            errors.value = error.response.data.errors;
          } else {
            const msgError =
              "Ocurrió un error inesperado contactese con el Administrador";
            Swal.fire({
              icon: "info",
              title: "Error",
              html: `<strong>${error}</strong>`,
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
        const now = new Date();
        const dia = String(now.getDate()).padStart(2, "0");
        const mes = String(now.getMonth() + 1).padStart(2, "0");
        const anio = now.getFullYear();
        const horas = String(now.getHours()).padStart(2, "0");
        const minutos = String(now.getMinutes()).padStart(2, "0");

        const fecha_c = `${dia}/${mes}/${anio} ${horas}:${minutos}`;

        const cuenta_cobrar = await cuentaCobrarStore.nuevoPago(form.id, {
          id: 0,
          cuenta_cobrar_id: form.id,
          cancelado: montoPago.value, // ← corregido
          fecha: now.toISOString().slice(0, 10),
          hora: now.toTimeString().slice(0, 5),
          fecha_c: fecha_c, // ← aquí va la fecha completa
        });
        console.log(cuenta_cobrar);
        Swal.fire({
          icon: "success",
          title: "Correcto",
          html: `<strong>Registro correcto</strong>`,
          confirmButtonText: `Aceptar`,
          customClass: {
            confirmButton: "btn-success",
          },
        });
        limpiarCuentaCobrar();
        emits("envio-formulario");
      } catch (error) {
        const msgError = "Ocurrió un error inesperado intente nuevamente";
        Swal.fire({
          icon: "info",
          title: "Error",
          html: `<strong>${msgError}</strong>`,
          confirmButtonText: `Aceptar`,
          customClass: {
            confirmButton: "btn-error",
          },
        });
      } finally {
        enviando.value = false;
      }
    }
  };
  const verificarSaldoMonto = () => {
    const saldo_restante = form.total - parseFloat(form.cancelado);
    console.log("restante: ", saldo_restante);
    if (saldo_restante < 0 || montoPago.value == 0) {
      return false;
    }
    return true;
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

  const oldCancelado = ref(0);
  const detectarMonto = () => {
    if (montoPago.value) {
      form.cancelado =
        parseFloat(oldCancelado.value) + parseFloat(montoPago.value);
      form.saldo = parseFloat(form.total) - parseFloat(form.cancelado);
    } else {
      form.cancelado = parseFloat(oldCancelado.value) + parseFloat(0);
      form.saldo = parseFloat(form.total) - parseFloat(form.cancelado);
    }
  };

  onMounted(() => {});
</script>

<template>
  <MiModal
    :open_modal="muestra_form"
    @close="cerrarFormulario"
    :size="'modal-xl'"
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
            <div class="card">
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <div class="row">
                      <div class="col-4 text-right">
                        <strong>Orden de Venta:</strong>
                      </div>
                      <div class="col-8">{{ form.orden_venta?.codigo }}</div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="row">
                      <div class="col-4 text-right">
                        <strong>Cliente:</strong>
                      </div>
                      <div class="col-8">{{ form.cliente?.razon_social }}</div>
                    </div>
                  </div>
                </div>
                <div class="row mt-3">
                  <div class="col-md-4">
                    <div class="row">
                      <div class="col-4 text-right">
                        <strong>Total:</strong>
                      </div>
                      <div class="col-8">
                        {{ getFormatoMoneda(form.total) }} Bs
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="row">
                      <div class="col-4 text-right">
                        <strong>Cancelado:</strong>
                      </div>
                      <div class="col-8">
                        {{ getFormatoMoneda(form.cancelado) }} Bs
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="row">
                      <div class="col-4 text-right">
                        <strong>Saldo:</strong>
                      </div>
                      <div class="col-8">
                        {{ getFormatoMoneda(form.saldo) }} Bs
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <el-collapse :expand-icon-position="'left'">
              <el-collapse-item title="" name="1">
                <template #title>
                  <div>Pagos realizados</div>
                </template>
                <div class="row">
                  <div class="col-12">
                    <table class="table table-bordered mb-0">
                      <thead>
                        <tr>
                          <th>Nro.</th>
                          <th>Monto Bs</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        <template v-if="form.cuenta_cobrar_detalles.length > 0">
                          <tr
                            v-for="(item, index) in form.cuenta_cobrar_detalles"
                          >
                            <td>{{ index + 1 }}</td>
                            <td>{{ item.cancelado }}</td>
                            <td>{{ item.fecha_c }}</td>
                          </tr>
                        </template>
                        <template v-else>
                          <tr>
                            <td
                              colspan="3"
                              class="text-center text-muted font-weight-bold"
                            >
                              NO SE ENCONTRARÓN REGISTROS
                            </td>
                          </tr>
                        </template>
                      </tbody>
                    </table>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
        <div
          class="row"
          v-if="
            authStore?.user?.permisos == '*' ||
            authStore?.user?.permisos.includes('cuenta_cobrars.pago')
          "
        >
          <div class="col-md-12 mt-2">
            <label class="required">Monto Bs</label>
            <el-input
              type="number"
              step="0.1"
              :class="{
                'parsley-error': errors?.cancelado,
              }"
              v-model="montoPago"
              @keyup="detectarMonto"
              autosize
            ></el-input>
            <ul
              v-if="errors?.cancelado"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ errors?.cancelado[0] }}
              </li>
            </ul>
          </div>
        </div>
        <div class="row"></div>
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
          authStore?.user?.permisos == '*' ||
          authStore?.user?.permisos.includes('cuenta_cobrars.pago')
        "
        type="button"
        class="btn btn-success"
        :disabled="enviando"
        @click.prevent="enviarFormulario"
        v-html="textBtn"
      ></button>
    </template>
  </MiModal>
</template>
