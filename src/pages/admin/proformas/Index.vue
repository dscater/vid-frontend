<script setup>
  import Content from "../../../Components/Content.vue";
  import MiTable from "../../../Components/MiTable.vue";
  import { useProformas } from "../../../composables/proformas/useProformas";
  import { ref, onMounted, onBeforeMount } from "vue";
  import { useAppStore } from "../../../stores/aplicacion/appStore";
  import { useAuthStore } from "../../../stores/authStore";
  import api from "../../../composables/axios.js";
  import { useRouter } from "vue-router";
  import { useProformaStore } from "../../../stores/offlineStores/ProformaStore.js";
  import { useConnectivityStore } from "../../../stores/offlineStores/useConnectivityStore";
  const connectivityStore = useConnectivityStore();
  const proformaStore = useProformaStore();
  const router = useRouter();
  const apiUrl = import.meta.env.VITE_API_URL;
  const authStore = useAuthStore();
  const appStore = useAppStore();
  onBeforeMount(() => {
    appStore.startLoading();
  });

  onMounted(async () => {
    appStore.stopLoading();
    if (!connectivityStore.isOnline) {
      dataOffline.value = await proformaStore.getAll();
    }
  });

  const { setProforma, limpiarProforma } = useProformas();

  const dataOffline = ref([]);
  const miTable = ref(null);
  const headers = [
    {
      label: "CÓDIGO",
      key: "codigo",
      sortable: true,
      width: "4%",
    },
    {
      label: "SUCURSAL",
      key: "sucursals_txt",
      sortable: true,
    },
    {
      label: "FECHA",
      key: "fecha_c",
      sortable: true,
    },
    {
      label: "USUARIO",
      key: "user",
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

  const updateDatatable = async () => {
    if (miTable.value) {
      await miTable.value.cargarDatos();
      muestra_formulario.value = false;
      muestra_formulario_detalle.value = false;
    }
  };

  const editarProforma = (item) => {
    router.push({ name: "proformas.edit", params: { id: item.id } });
  };

  const mostrarProforma = (item) => {
    router.push({ name: "proformas.show", params: { id: item.id } });
  };

  const imprimirProforma = (item) => {
    router.push({ name: "proformas.imprimir", params: { id: item.id } });
  };

  const accion_formulario_detalle = ref(0);
  const muestra_formulario_detalle = ref(false);
  const eliminarProforma = (item) => {
    Swal.fire({
      title: "¿Quierés eliminar este registro?",
      html: `<strong>${item.codigo}</strong>`,
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
        let respuesta = await api.post("/admin/proformas/" + item.id, {
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
          <h1 class="m-0">Proformas</h1>
        </div>
        <!-- /.col -->
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-right">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'Inicio' }">Inicio</router-link>
            </li>
            <li class="breadcrumb-item active">Proformas</li>
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
              v-if="
                connectivityStore.isOnline &&
                (authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes('proformas.create'))
              "
              class="btn btn-success"
              :to="{ name: 'proformas.create' }"
            >
              <i class="fa fa-plus"></i> Nueva Proforma
            </router-link>
          </div>
          <div class="col-md-8 my-1">
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
              :url="apiUrl + '/admin/proformas/paginado'"
              :numPages="5"
              :multiSearch="multiSearch"
              :token="authStore.token"
              :syncOrderBy="'id'"
              :syncOrderAsc="'DESC'"
              table-responsive
              :header-class="'bg__primary'"
              fixed-header
            >
              <template #user="{ item }">
                {{ item.user.nombre }} {{ item.user.paterno }}
                {{ item.user.materno }}
              </template>

              <template #accion="{ item }">
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="Imprimir"
                  placement="left-start"
                >
                  <button
                    class="btn btn-primary"
                    @click="imprimirProforma(item)"
                  >
                    <i class="fa fa-print"></i></button
                ></el-tooltip>

                <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="Detalles"
                  placement="left-start"
                >
                  <button
                    class="btn btn-primary"
                    @click="mostrarProforma(item)"
                  >
                    <i class="fa fa-list"></i></button
                ></el-tooltip>
                <template
                  v-if="
                    connectivityStore?.isOnline &&
                    (authStore?.user?.permisos == '*' ||
                      authStore?.user?.permisos.includes('proformas.edit'))
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
                      @click="editarProforma(item)"
                    >
                      <i class="fa fa-pen"></i></button
                  ></el-tooltip>
                </template>

                <template
                  v-if="
                    connectivityStore?.isOnline &&
                    (authStore?.user?.permisos == '*' ||
                      authStore?.user?.permisos.includes('proformas.destroy'))
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
                      @click="eliminarProforma(item)"
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
              <template #user="{ item }">
                {{ item.user.nombre }} {{ item.user.paterno }}
                {{ item.user.materno }}
              </template>

              <template #accion="{ item }">
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="Detalles"
                  placement="left-start"
                >
                  <button
                    class="btn btn-primary"
                    @click="mostrarProforma(item)"
                  >
                    <i class="fa fa-list"></i></button
                ></el-tooltip>
              </template>
            </MiTable>
          </div>
        </div>
      </div>
    </div>
  </Content>
</template>
