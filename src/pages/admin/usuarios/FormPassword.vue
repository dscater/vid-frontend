<script setup>
  import { useUsuarios } from "../../../composables/usuarios/useUsuarios";
  import { watch, ref, computed, defineEmits } from "vue";
  import api from "../../../composables/axios";
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

  const { oUsuario, limpiarUsuario } = useUsuarios();
  const accion = ref(props.accion_formulario);
  const formulario = ref(props.muestra_formulario);
  let form = ref({
    password: "",
    _method: "PUT",
  });
  watch(
    () => props.muestra_formulario,
    (newValue) => {
      formulario.value = newValue;
      form.errors = null;

      document.getElementsByTagName("body")[0].classList.add("modal-open");
    }
  );
  watch(
    () => props.accion_formulario,
    (newValue) => {
      accion.value = newValue;
    }
  );

  const tituloFormulario = computed(() => {
    return accion.value == 0 ? `Agregar Usuario` : `Actualizar Contraseña`;
  });

  const enviarFormulario = () => {
    let url = "admin/usuarios/password/" + oUsuario.value.id;
    api
      .post(url, form.value)
      .then((response) => {
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
        form.password = "";
        limpiarUsuario();
        emits("envio-formulario");
      })
      .catch((error) => {
        if (
          error.response &&
          error.response.data &&
          error.response.data.errors
        ) {
          let msgError =
            "Existen errores en el formulario, por favor verifique";

          if (
            error.response.data.errors.error &&
            error.response.data.errors.error[0]
          ) {
            msgError = "Ocurrió un error al registrar intente mas tarde";
          }

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

  watch(formulario, (newVal) => {
    if (!newVal) {
      emits("cerrar-formulario");
    }
  });

  const cerrarFormulario = () => {
    formulario.value = false;
  };

  const showPassword = ref(false);
  const toggleShowPassword = () => {
    showPassword.value = !showPassword.value;
  };
</script>

<template>
  <div
    class="modal fade"
    :class="{
      show: formulario,
    }"
    id="modal-formulario-form"
    :style="{
      display: formulario ? 'block' : 'none',
    }"
  >
    <div class="modal-formulario modal-lg mx-auto">
      <div class="modal-content">
        <div class="modal-header bg-navy text-white">
          <h4 class="modal-title text-white" v-html="tituloFormulario"></h4>
          <button type="button" class="close" @click="cerrarFormulario()">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="enviarFormulario()">
            <div class="row">
              <div class="px-4 text-center col-md-12">
                <span class="text-body-2 h3"
                  >{{ oUsuario.nombre }}
                  {{ oUsuario.paterno }}
                  {{ oUsuario.materno }}</span
                >
              </div>
            </div>
            <div class="row">
              <div class="col-md-12">
                <label>Ingresa la nueva contraseña:</label>
                <div class="input-group">
                  <input
                    placeholder="Ingresa la nueva contraseña"
                    class="form-control"
                    autocomplete="false"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                  />
                  <div class="input-group-append">
                    <button
                      class="btn btn-default"
                      @click.prevent="toggleShowPassword"
                    >
                      <i
                        class="fa"
                        :class="{
                          'fa-eye': showPassword,
                          'fa-eye-slash': !showPassword,
                        }"
                      ></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <a
            href="javascript:;"
            class="btn btn-default"
            @click="cerrarFormulario()"
            ><i class="fa fa-times"></i> Cerrar</a
          >
          <button
            type="button"
            @click="enviarFormulario()"
            class="btn btn-success"
          >
            <i class="fa fa-save"></i>
            Guardar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
