<script>
  import Login from "../../Layouts/Auth.vue";
  export default {
    layout: Login,
  };
</script>

<script setup>
  import { nextTick, onBeforeMount, onMounted, watch } from "vue";
  import { ref } from "vue";
  import { useConfiguracionStore } from "../../stores/configuracion/configuracionStore";
  import { verificaImagen } from "../../composables/useLoadings/verificaImagen";
  import { useAuthStore } from "../../stores/authStore";
  import { useRouter } from "vue-router";

  const configuracionStore = useConfiguracionStore();

  const form = ref({
    usuario: "",
    password: "",
  });
  const loadingLogo = ref(true);
  const muestra_password = ref(false);

  onBeforeMount(() => {
    loadingLogo.value = true;
  });

  const authStore = useAuthStore();
  const router = useRouter();
  const submit = async () => {
    await authStore.login(form.value);

    if (authStore.errors) {
      Swal.fire({
        icon: "info",
        title: "Error",
        text: `${authStore.errors}`,
        customClass: {
          confirmButton: "btn-success",
        },
        confirmButtonText: `Aceptar`,
      });
    } else {
      // Redirigir a dashboard
      router.push({ name: "Inicio" });
    }
  };

  onMounted(async () => {
    configuracionStore.initConfiguracion();
  });

  watch(
    () => configuracionStore.oConfiguracion.url_logo,
    async (newUrl) => {
      if (!newUrl) return;
      try {
        const resp = await verificaImagen(newUrl);
        loadingLogo.value = !resp;
      } catch (e) {
        loadingLogo.value = true;
      }
    },
    { immediate: true } // también dispara la primera vez si ya tiene valor
  );
</script>

<template>
  <div class="row login">
    <div class="col-md-6 bg1 p-0 content_logo">
      <div class="w-100 d-none d-md-block h-100">
        <el-skeleton class="w-100 h-100" animated :loading="loadingLogo">
          <template #template>
            <el-skeleton-item variant="image" class="w-100 h-100" />
          </template>
          <template #default>
            <img
              :src="configuracionStore.oConfiguracion.url_logo"
              alt="Logo"
              class="w-100 h-100 cover"
              loading="lazy"
            />
          </template>
        </el-skeleton>
      </div>
    </div>
    <div class="col-md-6 bg1 p-5 contendor_formulario">
      <el-skeleton
        class="w-100 h-100 d-block d-md-none"
        animated
        :loading="loadingLogo"
      >
        <template #template>
          <el-skeleton-item variant="image" class="w-100 h-100" />
        </template>
        <template #default>
          <img
            :src="configuracionStore.oConfiguracion.url_logo"
            alt="Logo"
            class="d-block d-md-none mx-auto mb-2 rounded"
            style="max-height: 120px"
            loading="lazy"
          />
        </template>
      </el-skeleton>
      <a
        href="/"
        class="h1 w-100 text-center d-block nombre_sistema title_Chau_Philomene_One text-white"
        >{{ configuracionStore.oConfiguracion.nombre_sistema }}</a
      >
      <form @submit.prevent="submit">
        <p class="login-box-msg">Ingresa tú usuario y contraseña</p>
        <div class="row">
          <div class="col-12 mb-3">
            <div class="input-group">
              <input
                type="text"
                class="form-control"
                placeholder="Usuario"
                v-model="form.usuario"
                autofocus
              />
              <div class="input-group-append">
                <div class="input-group-text">
                  <span class="fas fa-user"></span>
                </div>
              </div>
            </div>
            <span class="text-danger" v-if="form.errors && form.errors.usuario">
              {{ form.errors.usuario }}
            </span>
          </div>
          <div class="col-12 mb-3">
            <div class="input-group">
              <input
                :type="muestra_password ? 'text' : 'password'"
                class="form-control"
                placeholder="Contraseña"
                v-model="form.password"
                autocomplete="false"
              />
              <div class="input-group-append">
                <button
                  class="btn btn-default"
                  type="button"
                  @click="muestra_password = !muestra_password"
                >
                  <i
                    class="fa"
                    :class="[muestra_password ? 'fa-eye' : 'fa-eye-slash']"
                  ></i>
                </button>
              </div>
              <div class="input-group-append">
                <div class="input-group-text">
                  <span class="fas fa-lock"></span>
                </div>
              </div>
            </div>
            <span
              class="text-danger"
              v-if="form.errors && form.errors.password"
            >
              {{ form.errors.password }}
            </span>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <button
              type="submit"
              class="btn btn-primary btn-block"
              :disabled="form.processing"
            >
              Acceder
            </button>
          </div>
          <!-- /.col -->
        </div>
      </form>
    </div>
  </div>
</template>
