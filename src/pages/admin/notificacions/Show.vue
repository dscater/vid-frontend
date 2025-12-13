<script setup>
  import Content from "../../../Components/Content.vue";
  import { useNotificacions } from "../../../composables/notificacions/useNotificacions";
  import { ref, onMounted, onBeforeMount, watch } from "vue";
  import { useAppStore } from "../../../stores/aplicacion/appStore";
  import { useAuthStore } from "../../../stores/authStore";
  import api from "../../../composables/axios.js";
  import { useRouter } from "vue-router";
  const apiUrl = import.meta.env.VITE_API_URL;
  const authStore = useAuthStore();
  import { onBeforeRouteUpdate } from "vue-router";

  const props = defineProps({
    id: {
      type: String,
      default: "",
    },
  });

  watch(
    () => props.id,
    (newId) => {
      if (newId) {
        cargarNotificacion();
      }
    }
  );
  const appStore = useAppStore();
  onBeforeMount(() => {
    appStore.startLoading();
  });

  const { setNotificacion, limpiarNotificacion, oNotificacion } =
    useNotificacions();
  const loadingNotificacion = ref(true);
  const notificacion = ref(null);
  const cargarNotificacion = () => {
    loadingNotificacion.value = true;
    api.get("/admin/notificacions/" + props.id).then((response) => {
      setNotificacion(response.data);
      loadingNotificacion.value = false;
    });
  };
  onMounted(() => {
    cargarNotificacion();
    appStore.stopLoading();
  });
</script>
<template>
  <Content>
    <template #header>
      <div class="row mb-2">
        <div class="col-sm-6">
          <h1 class="m-0">Notificaciones > <small>Ver</small></h1>
        </div>
        <!-- /.col -->
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-right">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'Inicio' }">Inicio</router-link>
            </li>
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'notificacions.index' }"
                >Notificaciones</router-link
              >
            </li>
            <li class="breadcrumb-item active">Ver</li>
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
              :to="{ name: 'notificacions.index' }"
            >
              <i class="fa fa-arrow-left"></i> Volver
            </router-link>
          </div>
          <div class="col-md-8 my-1"></div>
        </div>
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <p>
                  <strong>Descripción: </strong>
                  <span v-html="oNotificacion.descripcion"></span>
                </p>
                <p>
                  <strong>Fecha y hora:</strong> {{ oNotificacion.fecha_c }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Content>
</template>
