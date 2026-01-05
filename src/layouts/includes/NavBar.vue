<script setup>
  // Composables
  // import { usePage, Link } from "@inertiajs/vue3";
  import { onMounted, onUnmounted, ref } from "vue";
  import { useSideBar } from "../../composables/useSidebar.js";
  import { useConfiguracionStore } from "../../stores/configuracion/configuracionStore";
  import { useConnectivityStore } from "../../stores/offlineStores/useConnectivityStore";
  import { useSyncStore } from "../../stores/offlineStores/syncStore.js";
  import { useNotificacionStore } from "../../stores/notificacionStore.js";
  const connectivityStore = useConnectivityStore();
  const syncStore = useSyncStore();
  const notificacionStore = useNotificacionStore();
  const configuracionStore = useConfiguracionStore();
  import { useRouter } from "vue-router";
  import { useAuthStore } from "../../stores/authStore";
  const authStore = useAuthStore();

  const router = useRouter();
  // const { props } = usePage();
  const { toggleSidebar } = useSideBar();

  const logout = () => {
    Swal.fire({
      icon: "success",
      title: "Correcto",
      html: `Se cerro sesión exitosamente`,
      confirmButtonText: `Aceptar`,
      customClass: {
        confirmButton: "btn-success",
      },
    });
    authStore.logout();
    // router.push({ name: "Login" });
  };

  onMounted(() => {
    notificacionStore.cargarNotificacions();
  });

  onUnmounted(() => {});
</script>
<template>
  <!-- Navbar -->
  <nav
    class="main-header navbar navbar-expand navbar-white navbar-light bg-secundario"
  >
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
      <li class="nav-item d-flex align-items-center">
        <span
          class="badge text-md"
          :class="[
            connectivityStore.isOnline ? 'bg4 text-success' : 'bg5 text-danger',
          ]"
        >
          <i class="fa fa-circle"></i>
          {{ connectivityStore.isOnline ? "Conectado" : "Sin Conexión" }}</span
        >
        <button
          v-if="connectivityStore.isOnline"
          class="btn btn-sm btn-success ml-1"
          @click.prevent="syncStore.initialSyncAndCache"
          :disabled="syncStore.isSyncing"
        >
          <i class="fa fa-download text-xs"></i>
        </button>
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
      <li
        class="nav-item dropdown notificaciones show"
        v-if="
          authStore?.user?.permisos == '*' ||
          authStore?.user?.permisos.includes('notificacions.index')
        "
      >
        <a
          class="nav-link"
          data-toggle="dropdown"
          href="#"
          aria-expanded="true"
        >
          <i class="far fa-bell text-white"></i>
          <span class="badge badge-warning navbar-badge">{{
            notificacionStore.notificacions.length
          }}</span>
        </a>
        <div
          class="dropdown-menu dropdown-menu-lg dropdown-menu-right"
          style="left: inherit; right: 0px"
        >
          <span class="dropdown-item dropdown-header"
            >{{ notificacionStore.notificacions.length }} Notifications</span
          >
          <div class="dropdown-divider"></div>
          <template v-if="notificacionStore.notificacions.length > 0">
            <router-link
              :to="{
                name: 'notificacions.show',
                params: {
                  id: item.id,
                },
              }"
              class="dropdown-item"
              v-for="item in notificacionStore.notificacions"
            >
              <i class="fas fa-envelope mr-2"></i>
              <span v-html="item.descripcion"></span>
              <span class="float-right text-muted text-sm">{{
                item.hace
              }}</span>
            </router-link>
          </template>
          <template v-else>
            <span class="dropdown-item text-muted text-center text-sm"
              >SIN NOTIFICACIONES</span
            >
          </template>
          <div class="dropdown-divider"></div>
          <router-link
            :to="{ name: 'notificacions.index' }"
            class="dropdown-item dropdown-footer"
            >Ver todas las notifiacciones</router-link
          >
        </div>
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
