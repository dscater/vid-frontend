<script setup>
  import MiModal from "../../../Components/MiModal.vue";
  import { useDevolucionClientes } from "../../../composables/devolucion_clientes/useDevolucionClientes";
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

  const { oDevolucionCliente, limpiarDevolucionCliente } =
    useDevolucionClientes();
  const accion_form = ref(props.accion_formulario);
  const muestra_form = ref(props.muestra_formulario);
  const enviando = ref(false);
  let form = reactive(oDevolucionCliente.value);
  watch(
    () => props.muestra_formulario,
    (newValue) => {
      muestra_form.value = newValue;
      if (muestra_form.value) {
        cargarListas();
        document.getElementsByTagName("body")[0].classList.add("modal-open");
        form = oDevolucionCliente.value;
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
      ? `<i class="fa fa-minus"></i> Detalles`
      : `<i class="fa fa-list"></i> Ver Detalles Orden de Salida`;
  });

  const verificarObservaciones = () => {
    let obs = 0;
    form.devolucion_cliente_detalles.forEach((item, index) => {
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

  const enviarFormulario = () => {
    verificarObservaciones();
    enviando.value = true;
    let url =
      accion_form.value == 0
        ? "/admin/devolucion_clientes"
        : "/admin/devolucion_clientes/aprobar/" + form.id;

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
        limpiarDevolucionCliente();
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
        <div class="row">
          <div class="col-12 overflow-auto">
            <table class="table table-bordered mb-0">
              <thead class="bg-secundario">
                <tr>
                  <th width="1%">NRO.</th>
                  <th>PRODUCTO</th>
                  <th width="60px">CANTIDAD</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="form.devolucion_cliente_detalles.length > 0">
                  <tr v-for="(item, index) in form.devolucion_cliente_detalles">
                    <td>{{ index + 1 }}</td>
                    <td>{{ item.producto.nombre }}</td>
                    <td>
                      {{ item.cantidad }}
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" class="text-right font-weight-bold text-md">
                      TOTAL
                    </td>
                    <td class="font-weight-bold text-md">
                      {{ form.cantidad_total }}
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
              v-if="form.errors?.devolucion_cliente_detalles"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.devolucion_cliente_detalles[0] }}
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
            authStore?.user?.permisos.includes('devolucion_clientes.aprobar'))
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
