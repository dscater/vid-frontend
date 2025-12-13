<script setup>
  import Content from "../../Components/Content.vue";
  import { ref, onMounted, onBeforeMount, computed } from "vue";
  import { useAppStore } from "../../stores/aplicacion/appStore";
  import { useAuthStore } from "../../stores/authStore";
  import api from "../../composables/axios.js";
  import { useRouter } from "vue-router";
  import { useConfiguracionStore } from "../../stores/configuracion/configuracionStore";
  import { useOrdenVentaStore } from "../../stores/offlineStores/ordenVentaStore.js";
  import { useConnectivityStore } from "../../stores/offlineStores/useConnectivityStore";
  const appStore = useAppStore();
  const connectivityStore = useConnectivityStore();
  const ordenVentaStore = useOrdenVentaStore();
  const configuracionStore = useConfiguracionStore();
  const apiUrl = import.meta.env.VITE_API_URL;
  const authStore = useAuthStore();

  onMounted(() => {
    appStore.stopLoading();
  });
</script>
<template>
  <Content>
    <template #header>
      <div class="row mb-2">
        <div class="col-sm-6">
          <h1 class="m-0">Sin acceso</h1>
        </div>
        <!-- /.col -->
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-right">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'Inicio' }">Inicio</router-link>
            </li>
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'orden_ventas.index' }"
                >OrdenVentas</router-link
              >
            </li>
            <li class="breadcrumb-item active">Sin acceso</li>
          </ol>
        </div>
        <!-- /.col -->
      </div>
      <!-- /.row -->
    </template>
    <div class="row">
      <div class="col-md-12">
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <div class="alert alert-danger">
                  <h4 class="text-center">
                    Ups!<br />
                    Usted no tiene acceso para ver esta página
                  </h4>
                </div>
                <div class="col-12 text-center">
                  <router-link class="btn btn-default" :to="{ name: 'Inicio' }"
                    >Volver al inicio</router-link
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Content>
</template>
