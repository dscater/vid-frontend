<script setup>
  import Content from "../../../Components/Content.vue";
  import { useOrdenVentas } from "../../../composables/orden_ventas/useOrdenVentas";
  import { ref, onMounted, onBeforeMount } from "vue";
  import { useAppStore } from "../../../stores/aplicacion/appStore";
  import Formulario from "./Formulario.vue";
  import { useAuthStore } from "../../../stores/authStore";
  import api from "../../../composables/axios.js";
  import { useRouter } from "vue-router";
  const apiUrl = import.meta.env.VITE_API_URL;
  const authStore = useAuthStore();
  const appStore = useAppStore();
  onBeforeMount(() => {
    appStore.startLoading();
  });

  const { setOrdenVenta, limpiarOrdenVenta, oOrdenVenta } = useOrdenVentas();
  onMounted(() => {
    appStore.stopLoading();
    limpiarOrdenVenta();
  });
</script>
<template>
  <Content>
    <template #header>
      <div class="row mb-2">
        <div class="col-sm-6">
          <h1 class="m-0">Orden de Ventas > <small>Nuevo</small></h1>
        </div>
        <!-- /.col -->
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-right">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'Inicio' }">Inicio</router-link>
            </li>
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'orden_ventas.index' }"
                >Orden de Ventas</router-link
              >
            </li>
            <li class="breadcrumb-item active">Nuevo</li>
          </ol>
        </div>
        <!-- /.col -->
      </div>
      <!-- /.row -->
    </template>
    <div class="row">
      <div class="col-md-12">
        <div class="row">
          <div class="col-md-4">
            <router-link
              class="btn btn-default"
              :to="{ name: 'orden_ventas.index' }"
            >
              <i class="fa fa-arrow-left"></i> Volver
            </router-link>
          </div>
          <div class="col-md-8 my-1"></div>
        </div>
        <div class="row">
          <div class="col-12">
            <Formulario :orden_venta="oOrdenVenta"></Formulario>
          </div>
        </div>
      </div>
    </div>
  </Content>
</template>
