<script setup>
  import MiModal from "../../../Components/MiModal.vue";
  import { watch, ref, computed, onMounted, nextTick, reactive } from "vue";
  import api from "../../../composables/axios.js";
  import { useClienteStore } from "../../../stores/offlineStores/clienteStore.js";
  import { useConnectivityStore } from "../../../stores/offlineStores/useConnectivityStore";
  const connectivityStore = useConnectivityStore();
  const clienteStore = useClienteStore();
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

  const accion_form = ref(props.accion_formulario);
  const muestra_form = ref(props.muestra_formulario);
  const enviando = ref(false);
  let form = null;
  watch(
    () => props.muestra_formulario,
    (newValue) => {
      muestra_form.value = newValue;
      getParametro();
      if (muestra_form.value) {
        document.getElementsByTagName("body")[0].classList.add("modal-open");
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
      ? `<i class="fa fa-edit"></i> Parametros`
      : `<i class="fa fa-edit"></i> Editar Cliente`;
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

  const getParametro = () => {
    api.get("/admin/parametro_sucursals").then((response) => {
      form = reactive(response.data);
      if (form) {
        form.errors = null;
      }
    });
  };

  const enviarFormulario = async () => {
    enviando.value = true;
    if (connectivityStore.isOnline) {
      let url = "/admin/parametro_sucursals";
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
    } else {
      // OFFLINE
    }
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
  onMounted(() => {
    getParametro();
  });
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
      <form @submit.prevent="enviarFormulario()" v-if="form">
        <div class="row">
          <div class="col-md-4 mb-2">
            <label class="required">Hora Inicio</label>
            <input
              type="time"
              class="form-control"
              :class="{
                'parsley-error': form?.errors?.valor1,
              }"
              v-model="form.valor1"
              autosize
            />
            <ul
              v-if="form?.errors?.valor1"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form?.errors?.valor1[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mb-2">
            <label class="required">Hora Fin</label>
            <input
              type="time"
              class="form-control"
              :class="{
                'parsley-error': form?.errors?.valor2,
              }"
              v-model="form.valor2"
              autosize
            />
            <ul
              v-if="form?.errors?.valor2"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form?.errors?.valor2[0] }}
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
</template>
<style scoped>
  .fila_contacto {
    position: relative;
    margin-top: 10px;
  }
  .btnEliminar {
    font-size: 0.6em;
    top: -16px;
    left: 0;
    position: absolute;
  }
</style>
