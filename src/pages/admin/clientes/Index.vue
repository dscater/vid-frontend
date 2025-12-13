<script setup>
  import Content from "../../../Components/Content.vue";
  import MiTable from "../../../Components/MiTable.vue";
  import { useClientes } from "../../../composables/clientes/useClientes";
  import { ref, onMounted, onBeforeMount } from "vue";
  import { useAppStore } from "../../../stores/aplicacion/appStore";
  import Formulario from "./Formulario.vue";
  import Parametros from "./Parametros.vue";
  import { useAuthStore } from "../../../stores/authStore";
  import api from "../../../composables/axios.js";
  import { useRouter } from "vue-router";
  import { useClienteStore } from "../../../stores/offlineStores/clienteStore.js";
  import { useConnectivityStore } from "../../../stores/offlineStores/useConnectivityStore";
  const connectivityStore = useConnectivityStore();
  const clienteStore = useClienteStore();
  const apiUrl = import.meta.env.VITE_API_URL;
  const authStore = useAuthStore();
  const appStore = useAppStore();
  onBeforeMount(() => {
    appStore.startLoading();
  });

  onMounted(async () => {
    appStore.stopLoading();
    if (!connectivityStore.isOnline) {
      dataOffline.value = await clienteStore.getAll();
    }
  });

  const { setCliente, limpiarCliente } = useClientes();

  const dataOffline = ref([]);
  const miTable = ref(null);
  const headers = [
    {
      label: "RAZÓN SOCIAL",
      key: "razon_social",
      sortable: true,
      fixed: true,
    },
    {
      label: "RANK",
      key: "rank",
      sortable: true,
      fixed: true,
    },
    {
      label: "CATEGORÍA",
      key: "categoria",
      sortable: true,
      fixed: true,
    },
    {
      label: "NOMBRE PROPIETARIO",
      key: "nombre_prop",
      sortable: true,
      fixed: true,
    },
    {
      label: "TIPO CLIENTE",
      key: "tipo",
      sortable: true,
    },
    {
      label: "NIT",
      key: "nit",
      sortable: true,
    },
    {
      label: "NOMBRE PUNTO VENTA",
      key: "nombre_punto",
      sortable: true,
    },
    {
      label: "C.I. PROPIETARIO",
      key: "ci_prop",
      sortable: true,
    },
    {
      label: "CORREO",
      key: "correo",
      sortable: true,
    },
    {
      label: "CELULAR",
      key: "cel",
      sortable: true,
    },
    {
      label: "TELÉFONO",
      key: "fono",
      sortable: true,
    },
    {
      label: "DIRECCIÓN",
      key: "dir",
      sortable: true,
    },
    {
      label: "ESTADO",
      key: "estado",
      sortable: true,
    },
    {
      label: "ACCIÓN",
      key: "accion",
      fixed: "right",
      width: "4%",
    },
  ];

  const multiSearch = ref({
    search: "",
    filtro: [],
  });

  const accion_formulario = ref(0);
  const muestra_formulario = ref(false);
  const accion_formulario_parametros = ref(0);
  const muestra_formulario_parametros = ref(false);

  const agregarRegistro = () => {
    limpiarCliente();
    accion_formulario.value = 0;
    muestra_formulario.value = true;
  };

  const verParametros = () => {
    accion_formulario_parametros.value = 0;
    muestra_formulario_parametros.value = true;
  };

  const updateDatatable = async () => {
    if (miTable.value) {
      if (connectivityStore.isOnline) {
        await miTable.value.cargarDatos();
      } else {
        dataOffline.value = await clienteStore.getAll();
      }
      muestra_formulario.value = false;
    }
  };

  const eliminarCliente = (item) => {
    Swal.fire({
      title: "¿Quierés eliminar este registro?",
      html: `<strong>${item.razon_social}</strong>`,
      showCancelButton: true,
      confirmButtonText: "Si, eliminar",
      cancelButtonText: "No, cancelar",
      denyButtonText: `No, cancelar`,
      customClass: {
        confirmButton: "btn-danger",
      },
    }).then(async (result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        let respuesta = await api.post("/admin/clientes/" + item.id, {
          _method: "DELETE",
        });
        if (respuesta.data && respuesta.data.sw) {
          const success =
            respuesta.data.message ?? "Proceso realizado con éxito";
          Swal.fire({
            icon: "success",
            title: "Correcto",
            html: `<strong>${success}</strong>`,
            confirmButtonText: `Aceptar`,
            customClass: {
              confirmButton: "btn-success",
            },
          });
          updateDatatable();
        }
      }
    });
  };
</script>
<template>
  <Content>
    <template #header>
      <div class="row mb-2">
        <div class="col-sm-6">
          <h1 class="m-0">Clientes</h1>
        </div>
        <!-- /.col -->
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-right">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'Inicio' }">Inicio</router-link>
            </li>
            <li class="breadcrumb-item active">Clientes</li>
          </ol>
        </div>
        <!-- /.col -->
      </div>
      <!-- /.row -->
    </template>
    <div class="row">
      <div class="col-md-12">
        <div class="row">
          <div class="col-md-6">
            <button
              v-if="
                authStore?.user?.permisos == '*' ||
                authStore?.user?.permisos.includes('clientes.create')
              "
              type="button"
              class="btn btn-success"
              @click="agregarRegistro"
            >
              <i class="fa fa-plus"></i> Nuevo Cliente
            </button>
            <button
              v-if="
                connectivityStore.isOnline &&
                (authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes(
                    'clientes.parametro_clientes'
                  ))
              "
              type="button"
              class="btn btn-primary ml-1"
              @click="verParametros"
            >
              <i class="fa fa-list"></i> Parametros Ranking
            </button>
          </div>
          <div class="col-md-6 my-1">
            <div class="row justify-content-end">
              <div class="col-md-5">
                <div class="input-group" style="align-items: end">
                  <input
                    v-model="multiSearch.search"
                    placeholder="Buscar"
                    class="form-control border-1 border-right-0"
                  />
                  <div class="input-append">
                    <button
                      class="btn btn-default rounded-0 border-left-0"
                      @click="updateDatos"
                    >
                      <i class="fa fa-search"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <MiTable
              v-if="connectivityStore.isOnline"
              :tableClass="'bg-white mitabla'"
              ref="miTable"
              :cols="headers"
              :api="true"
              :url="apiUrl + '/admin/clientes/paginado'"
              :numPages="5"
              :multiSearch="multiSearch"
              :token="authStore.token"
              :syncOrderBy="'id'"
              :syncOrderAsc="'DESC'"
              table-responsive
              :header-class="'bg__primary'"
              fixed-header
            >
              <template #estado="{ item }">
                <span
                  class="badge text-sm"
                  :class="[
                    {
                      'bg-success': item.estado == 1,
                      'bg-danger': item.estado == 0,
                    },
                  ]"
                >
                  {{ item.estado_t }}</span
                >
              </template>
              <template #accion="{ item }">
                <template
                  v-if="
                    authStore?.user?.permisos == '*' ||
                    authStore?.user?.permisos.includes('clientes.edit')
                  "
                >
                  <el-tooltip
                    class="box-item"
                    effect="dark"
                    content="Editar"
                    placement="left-start"
                  >
                    <button
                      class="btn btn-warning"
                      @click="
                        setCliente(item);
                        accion_formulario = 1;
                        muestra_formulario = true;
                      "
                    >
                      <i class="fa fa-pen"></i></button
                  ></el-tooltip>
                </template>

                <template
                  v-if="
                    authStore?.user?.permisos == '*' ||
                    authStore?.user?.permisos.includes('clientes.destroy')
                  "
                >
                  <el-tooltip
                    class="box-item"
                    effect="dark"
                    content="Eliminar"
                    placement="left-start"
                  >
                    <button
                      class="btn btn-danger"
                      @click="eliminarCliente(item)"
                    >
                      <i class="fa fa-trash-alt"></i></button
                  ></el-tooltip>
                </template>
              </template>
            </MiTable>
            <MiTable
              v-if="!connectivityStore.isOnline"
              :tableClass="'bg-white mitabla'"
              ref="miTable"
              :cols="headers"
              :numPages="5"
              :data="dataOffline"
              :multiSearch="multiSearch"
              :token="authStore.token"
              :syncOrderBy="'id'"
              :syncOrderAsc="'DESC'"
              table-responsive
              :header-class="'bg__primary'"
              fixed-header
            >
              <template #estado="{ item }">
                <span
                  class="badge text-sm"
                  :class="[
                    {
                      'bg-success': item.estado == 1,
                      'bg-danger': item.estado == 0,
                    },
                  ]"
                >
                  {{ item.estado_t }}</span
                >
              </template>
              <template #accion="{ item }">
                <template
                  v-if="
                    authStore?.user?.permisos == '*' ||
                    authStore?.user?.permisos.includes('clientes.edit')
                  "
                >
                  <el-tooltip
                    class="box-item"
                    effect="dark"
                    content="Editar"
                    placement="left-start"
                  >
                    <button
                      class="btn btn-warning"
                      @click="
                        setCliente(item);
                        accion_formulario = 1;
                        muestra_formulario = true;
                      "
                    >
                      <i class="fa fa-pen"></i></button
                  ></el-tooltip>
                </template>

                <template
                  v-if="
                    authStore?.user?.permisos == '*' ||
                    authStore?.user?.permisos.includes('clientes.destroy')
                  "
                >
                  <el-tooltip
                    class="box-item"
                    effect="dark"
                    content="Eliminar"
                    placement="left-start"
                  >
                    <button
                      class="btn btn-danger"
                      @click="eliminarCliente(item)"
                    >
                      <i class="fa fa-trash-alt"></i></button
                  ></el-tooltip>
                </template>
              </template>
            </MiTable>
          </div>
        </div>
      </div>
    </div>
    <Formulario
      :muestra_formulario="muestra_formulario"
      :accion_formulario="accion_formulario"
      @envio-formulario="updateDatatable"
      @cerrar-formulario="muestra_formulario = false"
    ></Formulario>
    <Parametros
      :muestra_formulario="muestra_formulario_parametros"
      :accion_formulario="accion_formulario_parametros"
      @envio-formulario="
        updateDatatable();
        muestra_formulario_parametros = false;
      "
      @cerrar-formulario="muestra_formulario_parametros = false"
    ></Parametros>
  </Content>
</template>
