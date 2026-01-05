<script setup>
  import { onBeforeMount, onMounted } from "vue";
  import Footer from "./includes/Footer.vue";
  import NavBar from "./includes/NavBar.vue";
  import SideBar from "./includes/SideBar.vue";
  import { useAppStore } from "../stores/aplicacion/appStore";
  import { useAuthStore } from "../stores/authStore";
  const authStore = useAuthStore();

  const appStore = useAppStore();
  onBeforeMount(() => {
    appStore.initUserInfo();
  });

  const logout = () => {
    Swal.fire({
      icon: "info",
      title: "Atención",
      html: `Se cerro sesión por inactividad`,
      confirmButtonText: `Aceptar`,
      customClass: {
        confirmButton: "btn-success",
      },
    });
    authStore.logout();
  };
  let inactivityTimer = null;
  let INACTIVITY_LIMIT = 60 * 10000; // 10 minutos en ms
  // let INACTIVITY_LIMIT = 60 * 1000; // 1 minutos en ms
  // Resetear temporizador
  const resetTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(logout, INACTIVITY_LIMIT);
  };

  onMounted(() => {
    // Eventos que consideran actividad del usuario
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    resetTimer();
  });
</script>
<template>
  <div class="loading" :class="[appStore.loading == true ? 'show' : '']">
    <!-- <div class="loading show"> -->
    <template v-if="$slots.loading">
      <slot name="loading"></slot>
    </template>
    <template v-else>
      <i class="fa fa-spin fa-spinner fa-4x"></i>
    </template>
  </div>

  <div
    class="loading sync"
    :class="[Boolean(appStore.sync) == true ? 'show' : '']"
  >
    <!-- <div class="loading show"> -->
    <template v-if="$slots.loading">
      <slot name="loading"></slot>
    </template>
    <template v-else>
      <i class="fa fa-spin fa-spinner fa-4x"></i>
      <br />
      <div class="d-block">
        ESPERE
        <br />
        SINCRONIZANDO DATOS...
      </div>
    </template>
  </div>

  <div class="wrapper">
    <NavBar></NavBar>
    <SideBar></SideBar>
    <slot />
    <Footer></Footer>
  </div>
</template>
