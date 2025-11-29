<script setup>
  // Composables
  // import { usePage, Link } from "@inertiajs/vue3";
  import { onMounted, onUnmounted, ref } from "vue";
  import { useSideBar } from "../../composables/useSidebar.js";
  import { useConfiguracionStore } from "../../stores/configuracion/configuracionStore";
  const configuracionStore = useConfiguracionStore();
  import { useRouter } from "vue-router";
  import { useAuthStore } from "../../stores/authStore";
  const authStore = useAuthStore();

  const router = useRouter();
  // const { props } = usePage();
  const { toggleSidebar } = useSideBar();

  const logout = () => {
    authStore.logout();
    router.push({ name: "Login" });
  };

  onMounted(() => {});

  onUnmounted(() => {});
</script>
<template>
  <!-- Navbar -->
  <nav class="main-header navbar navbar-expand navbar-white navbar-light bg1">
    <!-- Left navbar links -->
    <ul class="navbar-nav">
      <li class="nav-item">
        <a
          class="nav-link toggleButton"
          href="#"
          role="button"
          @click.prevent="toggleSidebar"
          ><i class="fas fa-bars text-white"></i
        ></a>
      </li>
      <!-- <li class="nav-item d-none d-sm-inline-block">
                <Link :href="route('pagos.create')" class="nav-link">Nuevo Pago</Link>
            </li>
            <li class="nav-item d-none d-sm-inline-block">
                <Link :href="route('trabajos.create')" class="nav-link">Nuevo Trabajo</Link>
            </li> -->
    </ul>

    <!-- Right navbar links -->
    <ul class="navbar-nav ml-auto">
      <li class="nav-item">
        <a class="nav-link" data-widget="fullscreen" href="#" role="button">
          <i class="fas fa-expand-arrows-alt text-white"></i>
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#" role="button" @click.prevent="logout()">
          <i class="fas fa-power-off text-white"></i>
        </a>
      </li>
    </ul>
  </nav>
  <!-- /.navbar -->
</template>
