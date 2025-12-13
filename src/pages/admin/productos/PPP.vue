<script setup>
  import MiModal from "../../../Components/MiModal.vue";
  import { useProductos } from "../../../composables/productos/useProductos";
  import { watch, ref, computed, onMounted, nextTick, reactive } from "vue";
  import api from "../../../composables/axios.js";
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

  const { oProducto, limpiarProducto } = useProductos();
  const accion_form = ref(props.accion_formulario);
  const muestra_form = ref(props.muestra_formulario);
  const enviando = ref(false);
  let form = reactive(oProducto.value);
  watch(
    () => props.muestra_formulario,
    (newValue) => {
      muestra_form.value = newValue;
      if (muestra_form.value) {
        document.getElementsByTagName("body")[0].classList.add("modal-open");
        form = oProducto.value;
        form.errors = null;
        getPPP();
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
      ? `<i class="fa fa-plus"></i> Nuevo Producto`
      : `<i class="fa fa-edit"></i> Precio promedio ponderado`;
  });

  const textBtn = computed(() => {
    if (enviando.value) {
      return `<i class="fa fa-spin fa-spinner"></i> Enviando...`;
    }
    if (accion_form.value == 0) {
      return `<i class="fa fa-save"></i> Guardar`;
    }
    return `<i class="fa fa-edit"></i> Guardar cambios`;
  });
  const imagen = ref(null);
  function cargaArchivo(e, key) {
    form[key] = null;
    form[key] = e.target.files[0];
  }

  const enviarFormulario = () => {
    enviando.value = true;
    let url = "/admin/productos/ppp_update/" + form.id;

    const fd = new FormData();
    fd.append("_method", "POST");
    fd.append("precio_ppp", form.precio_ppp);
    fd.append("precio", form.precio);
    api
      .post(url, fd)
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
        limpiarProducto();
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

  const getPPP = () => {
    api.get("/admin/productos/ppp/" + form.id).then((response) => {
      form.precio_ppp = response.data;
    });
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
        <p class="text-muted text-xs mb-0">
          Todos los campos con
          <span class="text-danger">(*)</span> son obligatorios.
        </p>
        <div class="row">
          <div class="col-md-4 mb-2">
            <label class="required"
              >PPP
              <button class="btn btn-sm btn-default" @click.prevent="getPPP">
                <i class="fa fa-sync"></i></button
            ></label>
            <input
              type="number"
              class="form-control"
              :class="{
                'parsley-error': form.errors?.precio_ppp,
              }"
              readonly
              v-model="form.precio_ppp"
            />
            <ul
              v-if="form.errors?.precio_ppp"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.precio_ppp[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mb-2">
            <label class="required">Precio actual</label>
            <input
              type="number"
              class="form-control"
              :class="{
                'parsley-error': form.errors?.precio,
              }"
              v-model="form.precio"
              autosize
            />
            <ul
              v-if="form.errors?.precio"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.precio[0] }}
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
