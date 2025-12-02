<script setup>
  import Content from "../../../components/Content.vue";
  import {
    onMounted,
    ref,
    computed,
    onBeforeMount,
    reactive,
    nextTick,
    watch,
  } from "vue";
  import { useAppStore } from "../../../stores/aplicacion/appStore";
  import { useConfiguracionStore } from "../../../stores/configuracion/configuracionStore";
  import { useAuthStore } from "../../../stores/authStore";
  import api from "../../../composables/axios";
  const authStore = useAuthStore();
  const appStore = useAppStore();
  const configuracionStore = useConfiguracionStore();

  const enviando = ref(false);
  let form = reactive({
    _method: "put",
    nombre_sistema: "",
    alias: "",
    url_logo: "",
    logo: "",
    id: 0,
  });

  // Cargar configuraciones
  onBeforeMount(async () => {
    appStore.startLoading();
    await configuracionStore.initConfiguracion();
  });

  // Watch: cuando oConfiguracion cambia → actualizar form
  watch(
    () => configuracionStore.oConfiguracion,
    (nuevaConfig) => {
      if (!nuevaConfig) return;

      Object.assign(form, {
        ...nuevaConfig,
        _method: "put",
      });
    },
    { immediate: true }
  );

  const enviarFormulario = () => {
    enviando.value = true;
    const fd = new FormData();
    fd.append("nombre_sistema", form.nombre_sistema);
    fd.append("alias", form.alias);
    fd.append("logo", form.logo);
    fd.append("_method", form._method);

    api
      .post("admin/configuracions/" + form.id, fd)
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
        limpiaRefs();
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
        configuracionStore.initConfiguracion();
        enviando.value = false;
      });
  };
  const logo = ref(null);
  function cargaArchivo(e, key) {
    form[key] = null;
    form[key] = e.target.files[0];

    // Generar la URL del archivo cargado
    const fileUrl = URL.createObjectURL(form[key]);
    form["url_" + key] = fileUrl;
  }
  function limpiaRefs() {
    logo.value = null;
  }

  const btnGuardar = computed(() => {
    if (enviando.value) {
      return `Guardando... <i class="fa fa-spinner fa-spin"></i>`;
    }

    return `Guardar cambios <i class="fa fa-save"></i>`;
  });

  onMounted(async () => {
    appStore.stopLoading();
  });
</script>
<template>
  <Content>
    <form @submit.prevent="enviarFormulario()">
      <div class="row">
        <div class="col-md-4 form-group mb-3">
          <label class="required">Nombre del sistema</label>
          <input
            type="text"
            class="form-control"
            v-model="form.nombre_sistema"
          />
          <span class="text-danger" v-if="form.errors?.nombre_sistema">{{
            form.errors.nombre_sistema
          }}</span>
        </div>
        <div class="col-md-4 form-group mb-3">
          <label class="required">Alias</label>
          <input type="text" class="form-control" v-model="form.alias" />
          <span class="text-danger" v-if="form.errors?.alias">{{
            form.errors.alias
          }}</span>
        </div>
        <div class="col-md-4 form-group mb-3">
          <label class="required">Logo</label>
          <input
            type="file"
            class="form-control"
            @change="cargaArchivo($event, 'logo')"
            ref="logo"
          />
          <div class="logo_muestra w-100 text-center">
            <img :src="form.url_logo" alt="" v-if="form.url_logo" width="50%" />
          </div>
          <span class="text-danger" v-if="form.errors?.logo">{{
            form.errors.logo
          }}</span>
        </div>
      </div>
      <div class="row pb-5">
        <div
          class="col-12"
          v-if="
            authStore.user?.permisos == '*' ||
            authStore.user?.permisos.includes('configuracions.edit')
          "
        >
          <button
            type="submit"
            class="btn btn-primary"
            v-html="btnGuardar"
            :disabled="enviando"
          ></button>
        </div>
      </div>
    </form>
  </Content>
</template>
<style scoped>
  .logo_muestra {
    margin-top: 10px;
    width: 100%;
    text-align: center;
  }
  .logo_muestra img {
    max-width: 100%;
  }
</style>
