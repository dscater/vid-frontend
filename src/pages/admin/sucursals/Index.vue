<script setup>
  import Content from "../../../Components/Content.vue";
  import MiTable from "../../../Components/MiTable.vue";
  import { useSucursals } from "../../../composables/sucursals/useSucursals";
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

  onMounted(() => {
    appStore.stopLoading();
  });

  const { setSucursal, limpiarSucursal } = useSucursals();

  const miTable = ref(null);
  const headers = [
    {
      label: "",
      key: "id",
      sortable: true,
      width: "4%",
    },
    {
      label: "NOMBRE",
      key: "nombre",
      sortable: true,
    },
    {
      label: "DIRECCIÓN",
      key: "direccion",
      sortable: true,
    },
    {
      label: "TELÉFONO",
      key: "fono",
      sortable: true,
    },
    {
      label: "CORREO",
      key: "correo",
      sortable: true,
    },
    {
      label: "ENCARGADO",
      key: "user",
      sortable: true,
    },
    {
      label: "ESTADO",
      key: "estado",
      sortable: true,
    },
    {
      label: "MAXIMO VENTA DIARIO",
      key: "monto_dia",
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

  const agregarRegistro = () => {
    limpiarSucursal();
    accion_formulario.value = 0;
    muestra_formulario.value = true;
  };

  const updateDatatable = async () => {
    if (miTable.value) {
      await miTable.value.cargarDatos();
      muestra_formulario.value = false;
    }
  };

  const editar = (item) => {
    api.get("admin/sucursals/" + item.id).then((response) => {
      setSucursal(response.data);
      accion_formulario.value = 1;
      muestra_formulario.value = true;
    });
  };

  const eliminarSucursal = (item) => {
    Swal.fire({
      title: "¿Quierés eliminar este registro?",
      html: `<strong>${item.nombre}</strong>`,
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
        let respuesta = await api.post("/admin/sucursals/" + item.id, {
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
          <h1 class="m-0">Sucursales</h1>
        </div>
        <!-- /.col -->
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-right">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'Inicio' }">Inicio</router-link>
            </li>
            <li class="breadcrumb-item active">Sucursales</li>
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
            <button
              v-if="
                authStore?.user?.permisos == '*' ||
                authStore?.user?.permisos.includes('sucursals.create')
              "
              type="button"
              class="btn btn-success"
              @click="agregarRegistro"
            >
              <i class="fa fa-plus"></i> Nueva Sucursal
            </button>
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
              :url="apiUrl + '/admin/sucursals/paginado'"
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
                <div v-if="item.user">
                  {{ item.user.nombre }}
                  {{ item.user.paterno }}
                  {{ item.user.materno }}
                </div>
              </template>
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
                    item.almacen != 1 &&
                    item.almacen != 2 &&
                    (authStore?.user?.permisos == '*' ||
                      authStore?.user?.permisos.includes('sucursals.edit'))
                  "
                >
                  <el-tooltip
                    class="box-item"
                    effect="dark"
                    content="Editar"
                    placement="left-start"
                  >
                    <button class="btn btn-warning" @click="editar(item)">
                      <i class="fa fa-pen"></i></button
                  ></el-tooltip>
                </template>

                <template
                  v-if="
                    item.almacen != 1 &&
                    item.almacen != 2 &&
                    (authStore?.user?.permisos == '*' ||
                      authStore?.user?.permisos.includes('sucursals.destroy'))
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
                      @click="eliminarSucursal(item)"
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
  </Content>
</template>
