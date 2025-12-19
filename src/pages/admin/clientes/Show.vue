<script setup>
  import Content from "../../../Components/Content.vue";
  import { useClientes } from "../../../composables/clientes/useClientes";
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

  const { setCliente, limpiarCliente, oCliente } = useClientes();
  const loadingCliente = ref(true);
  const cargarCliente = () => {
    loadingCliente.value = true;
    api.get("/admin/clientes/" + props.id).then((response) => {
      setCliente(response.data);
      console.log(response.data);
      loadingCliente.value = false;
    });
  };
  onMounted(() => {
    cargarCliente();
    appStore.stopLoading();
  });
</script>
<template>
  <Content>
    <template #header>
      <div class="row mb-2">
        <div class="col-sm-6">
          <h1 class="m-0">Clientes > <small>Detalles</small></h1>
        </div>
        <!-- /.col -->
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-right">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'Inicio' }">Inicio</router-link>
            </li>
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'clientes.index' }"
                >Clientes</router-link
              >
            </li>
            <li class="breadcrumb-item active">Detalles</li>
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
              :to="{ name: 'clientes.index' }"
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
                  <strong>Razon social: </strong> {{ oCliente.razon_social }}
                </p>
                <p><strong>Tipo: </strong> {{ oCliente.tipo }}</p>
                <p><strong>NIT: </strong> {{ oCliente.nit }}</p>
                <p>
                  <strong>Nombre Punto de Venta: </strong>
                  {{ oCliente.nombre_punto }}
                </p>
                <p>
                  <strong>Nombre Propietario: </strong>
                  {{ oCliente.nombre_prop }}
                </p>
                <p>
                  <strong>C.I. Propietario: </strong> {{ oCliente.ci_prop }}
                </p>
                <p><strong>Correo: </strong> {{ oCliente.correo }}</p>
                <p><strong>Celular: </strong> {{ oCliente.cel }}</p>
                <p><strong>Teléfono: </strong> {{ oCliente.fono }}</p>
                <p><strong>Dirección: </strong> {{ oCliente.dir }}</p>
                <p>
                  <strong>Ubicación: </strong>
                  <a :href="oCliente.ubicacion" target="_blank">{{
                    oCliente.ubicacion
                  }}</a>
                </p>
                <p><strong>Ciudad: </strong> {{ oCliente.ciudad }}</p>
                <p>
                  <strong>Categoría: </strong>
                  <span
                    class="mx-1 badge text-md"
                    :class="{
                      'bg-success': oCliente.categoria == 'A',
                      'bg-info': oCliente.categoria == 'B',
                      'bg-warning': oCliente.categoria == 'C',
                    }"
                  >
                    <div class="mb-1">{{ oCliente.categoria }}</div>
                  </span>
                </p>
                <div class="row">
                  <div class="col-12">
                    <h4>Contactos</h4>
                  </div>
                  <div class="col-12" v-for="contacto in oCliente.contactos">
                    <div class="row">
                      <div class="col-md-3">
                        <p><strong>Nombre: </strong> {{ contacto.nombre }}</p>
                      </div>
                      <div class="col-md-3">
                        <p><strong>Teléfono: </strong> {{ contacto.fono }}</p>
                      </div>
                      <div class="col-md-3">
                        <p><strong>Celular: </strong> {{ contacto.cel }}</p>
                      </div>
                      <div class="col-md-3">
                        <p>
                          <strong>Observación: </strong>
                          {{ contacto.observacion }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Content>
</template>
