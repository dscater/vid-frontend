<script setup>
  import Content from "../../../Components/Content.vue";
  import MiTable from "../../../Components/MiTable.vue";
  import { useSucursalProductos } from "../../../composables/sucursal_productos/useSucursalProductos";
  import { ref, onMounted, onBeforeMount } from "vue";
  import { useAppStore } from "../../../stores/aplicacion/appStore";
  import Formulario from "./Formulario.vue";
  import { useAuthStore } from "../../../stores/authStore";
  import api from "../../../composables/axios.js";
  import { useRouter } from "vue-router";
  import axios from "axios";
  const apiUrl = import.meta.env.VITE_API_URL;
  const authStore = useAuthStore();
  const appStore = useAppStore();
  onBeforeMount(() => {
    appStore.startLoading();
  });

  onMounted(() => {
    appStore.stopLoading();
    cargarSucursals();
  });

  const { setSucursalProducto, limpiarSucursalProducto } =
    useSucursalProductos();

  const miTable = ref(null);
  const headers = [
    {
      label: "CÓDIGO PRODUCTO",
      key: "codigo",
      sortable: true,
    },
    {
      label: "PRODUCTO",
      key: "nombre",
      sortable: true,
    },
    {
      label: "CANTIDAD IDEAL STOCK",
      key: "cantidad_ideal",
      sortable: true,
    },
    {
      label: "CANTIDAD MÍNIMA DE STOCK",
      key: "cantidad_minima",
      sortable: true,
    },
    {
      label: "STOCK ACTUAL",
      key: "stock_actual",
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
    sucursal_id: "",
    filtro: [],
  });

  const accion_formulario = ref(0);
  const muestra_formulario = ref(false);
  const listSucursals = ref([]);
  const cargarSucursals = () => {
    api
      .get("/admin/sucursals/listado", {
        parmams: {
          estado: 1,
        },
      })
      .then((response) => {
        listSucursals.value = response.data.sucursals;
      });
  };

  const router = useRouter();

  const updateDatatable = async () => {
    if (miTable.value) {
      await miTable.value.cargarDatos();
      muestra_formulario.value = false;
    }
  };

  const editarSucursalProducto = (item) => {
    api
      .get("/admin/sucursal_productos/getSucursalProducto", {
        params: {
          sucursal_id: multiSearch.value.sucursal_id,
          producto_id: item.id,
        },
      })
      .then((response) => {
        setSucursalProducto(response.data.sucursal_producto);
        accion_formulario.value = 1;
        muestra_formulario.value = true;
      });
  };
</script>
<template>
  <Content>
    <template #header>
      <div class="row mb-2">
        <div class="col-sm-6">
          <h1 class="m-0">Productos Sucursal</h1>
        </div>
        <!-- /.col -->
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-right">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'Inicio' }">Inicio</router-link>
            </li>
            <li class="breadcrumb-item active">Productos Sucursal</li>
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
            <el-select
              class="w-100"
              size="large"
              v-model="multiSearch.sucursal_id"
              placeholder="Seleccionar Sucursal"
              filterable
              clearable
            >
              <el-option
                v-for="item in listSucursals"
                :key="item.id"
                :value="item.id"
                :label="item.nombre"
              ></el-option>
            </el-select>
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
              :tableClass="'bg-white mitabla'"
              ref="miTable"
              :cols="headers"
              :api="true"
              :url="apiUrl + '/admin/sucursal_productos/paginado'"
              :numPages="5"
              :multiSearch="multiSearch"
              :token="authStore.token"
              :syncOrderBy="'id'"
              :syncOrderAsc="'DESC'"
              table-responsive
              :header-class="'bg__primary'"
              fixed-header
            >
              <template #imagen="{ item }">
                <img :src="item.url_imagen" height="90px" />
              </template>
              <template #accion="{ item }">
                <template
                  v-if="
                    authStore?.user?.permisos == '*' ||
                    authStore?.user?.permisos.includes(
                      'sucursal_productos.edit'
                    )
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
                      @click="editarSucursalProducto(item)"
                    >
                      <i class="fa fa-pen"></i></button
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
  </Content>
</template>
