<script setup>
  import { ref, onMounted, onBeforeMount, reactive } from "vue";
  import Content from "../../../components/Content.vue";
  import { useAppStore } from "../../../stores/aplicacion/appStore";
  import api from "../../../composables/axios";
  import { useAuthStore } from "../../../stores/authStore";
  const authStore = useAuthStore();

  const appStore = useAppStore();
  onBeforeMount(() => {
    appStore.startLoading();
  });

  onMounted(() => {
    getUser();
    appStore.stopLoading();
  });

  const props = defineProps({
    id: {
      type: String,
    },
  });

  const oUser = ref(null);
  const foto = ref(null);
  const url_aux = ref("");
  const imagen_cargada = ref(false);
  const getUser = () => {
    api.get("/admin/usuarios/show/" + props.id).then((response) => {
      oUser.value = response.data;
      foto.value = oUser.value.foto;
      url_aux.value = oUser.value.url_foto;
    });
  };

  function cargaImagen(e) {
    foto.value = e.target.files[0];
    oUser.value.url_foto = URL.createObjectURL(foto.value);
    imagen_cargada.value = true;
  }

  function guardarImagen() {
    const fd = new FormData();
    fd.append("foto", foto.value);
    fd.append("_method", "PATCH");
    api
      .post("/admin/profile/update_foto", fd)
      .then((response) => {
        imagen_cargada.value = false;
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
        const authUser = useAuthStore();
        authUser.setUser(response.data.user);
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
      .finally(() => {});
  }

  function cancelarImagen() {
    imagen_cargada.value = false;
    oUser.value.url_foto = url_aux.value;
  }

  const form = reactive({
    password_actual: "",
    password: "",
    password_confirmation: "",
    _method: "patch",
  });

  const enviaFormulario = () => {
    const url = "/admin/profile";
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
        form.password_actual = "";
        form.password = "";
        form.password_confirmation = "";
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
        // enviando.value = false;
      });
  };
</script>

<template>
  <Content>
    <template #header>
      <div class="row mb-2">
        <div class="col-sm-6">
          <h1 class="m-0">Perfil</h1>
        </div>
        <!-- /.col -->
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-right">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'Inicio' }">Inicio</router-link>
            </li>
            <li class="breadcrumb-item active">Perfil</li>
          </ol>
        </div>
        <!-- /.col -->
      </div>
      <!-- /.row -->
    </template>
    <div class="row">
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <div class="row">
              <div class="info_foto w-100 text-center">
                <img class="image" :src="oUser?.url_foto" />
                <h4 class="mt-1 mb-1">
                  {{ oUser?.role?.nombre }}
                </h4>
                <label
                  v-if="!imagen_cargada"
                  class="btn btn-outline-success text-success"
                  id="labelFoto"
                  for="file_foto"
                  ><b>Cambiar foto</b
                  ><input
                    type="file"
                    id="file_foto"
                    accept="image/png, image/gif, image/jpeg"
                    hidden
                    @change="cargaImagen"
                /></label>
                <button
                  v-if="imagen_cargada"
                  class="w-50 mb-1 btn btn-success btn-sm"
                  @click="guardarImagen"
                >
                  Guardar cambios
                </button>
                <button
                  v-if="imagen_cargada"
                  class="w-50 mb-1 btn btn-default"
                  @click="cancelarImagen"
                >
                  Cancelar
                </button>
              </div>
            </div>
            <div cols="d-flex w-100">
              <div class="row mb-1">
                <div class="text-right font-weight-bold col-4">Nombre:</div>
                <div class="col-8">
                  {{ oUser?.full_name }}
                </div>
              </div>
              <div class="row mb-1">
                <div class="text-right font-weight-bold col-4">C.I.:</div>
                <div class="col-8">
                  {{ oUser?.full_ci }}
                </div>
              </div>
              <div class="row mb-1">
                <div class="text-right font-weight-bold col-4">Correo:</div>
                <div class="col-8">
                  {{ oUser?.correo }}
                </div>
              </div>
              <div class="row mb-1">
                <div class="text-right font-weight-bold col-4">Teléfono:</div>
                <div class="col-8">
                  {{ oUser?.fono }}
                </div>
              </div>
              <div class="row mb-1">
                <div class="text-right font-weight-bold col-4">
                  Fecha Registro:
                </div>
                <div class="col-8">
                  {{ oUser?.fecha_registro_t }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        class="col-md-8"
        v-if="
          authStore?.user?.permisos == '*' ||
          authStore?.user?.permisos.includes('profile.edit')
        "
      >
        <div class="card card-inverse pa-3">
          <div class="card-header">
            <h4 class="mb-0">Cambiar contraseña</h4>
          </div>
          <div class="card-body pt-0">
            <form>
              <div class="row">
                <div class="col-12 mb-2 text-danger">
                  <i
                    ><small
                      >Debes ingresar al menos
                      <span class="bold"
                        >8 caracteres con una combinación de al menos: 1
                        mayúscula, 1 número y un caracter especial(@#$.&)</span
                      ></small
                    ></i
                  >
                </div>
                <div class="col-12 mb-2">
                  <label class="mb-0">Contraseña actual</label>
                  <input
                    placeholder="Contraseña actual"
                    autocomplete="false"
                    v-model="form.password_actual"
                    type="password"
                    class="form-control"
                    :class="{
                      'parsley-error': form.errors?.password_actual,
                    }"
                  />
                  <ul
                    v-if="form.errors?.password_actual"
                    class="list-unstyled text-danger"
                  >
                    <li class="parsley-required">
                      {{ form.errors?.password_actual[0] }}
                    </li>
                  </ul>
                </div>
                <div class="col-12 mb-2">
                  <label class="mb-0">Ingresa la nueva contraseña</label>
                  <input
                    placeholder="Ingresa la nueva contraseña"
                    prepend-inner-icon="mdi-lock-outline"
                    autocomplete="false"
                    v-model="form.password"
                    type="password"
                    class="form-control mt-2"
                    :class="{
                      'parsley-error': form.errors?.password,
                    }"
                  />
                  <ul
                    v-if="form.errors?.password"
                    class="list-unstyled text-danger"
                  >
                    <li class="parsley-required">
                      {{ form.errors?.password[0] }}
                    </li>
                  </ul>
                </div>
                <div class="col-12 mb-2">
                  <label class="mb-0">Repite la nueva contraseña</label>
                  <input
                    placeholder="Repite la nueva contraseña"
                    autocomplete="false"
                    v-model="form.password_confirmation"
                    type="password"
                    class="form-control mt-2 mb-3"
                  />
                </div>
                <div class="col-md-4">
                  <button
                    type="button"
                    class="btn btn-success w-100"
                    @click="enviaFormulario"
                  >
                    Guardar cambios
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </Content>
</template>

<style scoped>
  label.btn.btn-principal {
    color: white !important;
  }
  .info_foto {
    display: flex;
    width: 100%;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .info_foto img.image {
    width: 150px;
    height: 150px;
    object-fit: cover;
    border-radius: 50%;
    border: solid 1px gray;
  }

  #labelFoto b,
  .text-success {
    color: green !important;
  }

  #labelFoto:hover b {
    color: white !important;
  }
</style>
