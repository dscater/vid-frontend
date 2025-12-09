<script setup>
  import Content from "../../../Components/Content.vue";
  import { useProformas } from "../../../composables/proformas/useProformas";
  import { ref, onMounted, onBeforeMount } from "vue";
  import { useAppStore } from "../../../stores/aplicacion/appStore";
  import Formulario from "./Formulario.vue";
  import { useAuthStore } from "../../../stores/authStore";
  import api from "../../../composables/axios.js";
  import { useRouter } from "vue-router";
  const apiUrl = import.meta.env.VITE_API_URL;
  const authStore = useAuthStore();
  const props = defineProps({
    id: {
      type: String,
      default: "",
    },
  });
  const appStore = useAppStore();
  onBeforeMount(() => {
    appStore.startLoading();
  });

  const { setProforma, limpiarProforma, oProforma } = useProformas();
  const loadingProforma = ref(true);
  const cargarProforma = () => {
    loadingProforma.value = true;
    api.get("/admin/proformas/" + props.id).then((response) => {
      setProforma(response.data.proforma);
      console.log(response.data.proforma);
      loadingProforma.value = false;
    });
  };
  onMounted(() => {
    cargarProforma();
    appStore.stopLoading();
  });
</script>
<template>
  <Content>
    <template #header>
      <div class="row mb-2">
        <div class="col-sm-6">
          <h1 class="m-0">Proformas > <small>Editar</small></h1>
        </div>
        <!-- /.col -->
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-right">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'Inicio' }">Inicio</router-link>
            </li>
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'proformas.index' }"
                >Proformas</router-link
              >
            </li>
            <li class="breadcrumb-item active">Editar</li>
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
              :to="{ name: 'proformas.index' }"
            >
              <i class="fa fa-arrow-left"></i> Volver
            </router-link>
          </div>
          <div class="col-md-8 my-1"></div>
        </div>
        <div class="row">
          <div class="col-12">
            <el-skeleton
              :loading="loadingProforma"
              animated
              :count="2"
              class="row"
            >
              <template #template>
                <div class="col-md-6">
                  <el-skeleton-item style="height: 200px"></el-skeleton-item>
                </div>
              </template>
              <template #default>
                <Formulario
                  :proforma="oProforma"
                  v-if="!loadingProforma"
                ></Formulario>
              </template>
            </el-skeleton>
          </div>
        </div>
      </div>
    </div>
  </Content>
</template>
