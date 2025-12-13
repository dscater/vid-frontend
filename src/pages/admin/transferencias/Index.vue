<script setup>
  import Content from "../../../Components/Content.vue";
  import MiTable from "../../../Components/MiTable.vue";
  import { useTransferencias } from "../../../composables/transferencias/useTransferencias";
  import { ref, onMounted, onBeforeMount } from "vue";
  import { useAppStore } from "../../../stores/aplicacion/appStore";
  import Formulario from "./Formulario.vue";
  import Detalles from "./Detalles.vue";
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

  const { setTransferencia, limpiarTransferencia } = useTransferencias();

  const miTable = ref(null);
  const headers = [
    {
      label: "CÓDIGO",
      key: "codigo",
      sortable: true,
      width: "4%",
    },
    {
      label: "SUCURSAL ORIGEN",
      key: "sucursal.nombre",
      sortable: true,
    },
    {
      label: "SUCURSAL DESTINO",
      key: "sucursal_destino.nombre",
      sortable: true,
    },
    {
      label: "CANTIDAD TOTAL",
      key: "cantidad_total",
      sortable: true,
    },
    {
      label: "FECHA",
      key: "fecha_c",
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

  const agregarRegistro = () => {
    limpiarTransferencia();
    accion_formulario.value = 0;
    muestra_formulario.value = true;
  };

  const updateDatatable = async () => {
    if (miTable.value) {
      await miTable.value.cargarDatos();
      muestra_formulario.value = false;
      muestra_formulario_detalle.value = false;
    }
  };

  const editarTransferencia = (item) => {
    api.get("/admin/transferencias/" + item.id).then((response) => {
      setTransferencia(response.data.transferencia);
      accion_formulario.value = 1;
      muestra_formulario.value = true;
    });
  };

  const accion_formulario_detalle = ref(0);
  const muestra_formulario_detalle = ref(false);
  const aprobarTransferencia = (item) => {
    api.get("/admin/transferencias/" + item.id).then((response) => {
      setTransferencia(response.data.transferencia);
      accion_formulario_detalle.value = 1;
      muestra_formulario_detalle.value = true;
    });
  };

  const eliminarTransferencia = (item) => {
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
        let respuesta = await api.post("/admin/transferencias/" + item.id, {
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
          <h1 class="m-0">Transferencias</h1>
        </div>
        <!-- /.col -->
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-right">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'Inicio' }">Inicio</router-link>
            </li>
            <li class="breadcrumb-item active">Transferencias</li>
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
                authStore?.user?.permisos.includes('transferencias.create')
              "
              type="button"
              class="btn btn-success"
              @click="agregarRegistro"
            >
              <i class="fa fa-plus"></i> Nueva Transferencia
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
              :url="apiUrl + '/admin/transferencias/paginado'"
              :numPages="5"
              :multiSearch="multiSearch"
              :token="authStore.token"
              :syncOrderBy="'id'"
              :syncOrderAsc="'DESC'"
              table-responsive
              :header-class="'bg__primary'"
              fixed-header
            >
              <template #user_aprobador="{ item }">
                {{ item.user_aprobador.nombre }}
                {{ item.user_aprobador.paterno }}
                {{ item.user_aprobador.materno }}
              </template>
              <template #user_solicitante="{ item }">
                {{ item.user_solicitante.nombre }}
                {{ item.user_solicitante.paterno }}
                {{ item.user_solicitante.materno }}
              </template>
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
                    @click="aprobarTransferencia(item)"
                  >
                    <i class="fa fa-list"></i></button
                ></el-tooltip>
                <template
                  v-if="
                    (authStore?.user.id == item.user_sol ||
                      authStore?.user?.permisos == '*') &&
                    item.verificado == 0 &&
                    (authStore?.user?.permisos == '*' ||
                      authStore?.user?.permisos.includes('transferencias.edit'))
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
                      @click="editarTransferencia(item)"
                    >
                      <i class="fa fa-pen"></i></button
                  ></el-tooltip>
                </template>

                <template
                  v-if="
                    item.verificado == 0 &&
                    (authStore?.user?.permisos == '*' ||
                      authStore?.user?.permisos.includes(
                        'transferencias.destroy'
                      ))
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
                      @click="eliminarTransferencia(item)"
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
    <Detalles
      :muestra_formulario="muestra_formulario_detalle"
      :accion_formulario="accion_formulario_detalle"
      @envio-formulario="updateDatatable"
      @cerrar-formulario="muestra_formulario_detalle = false"
    ></Detalles>
  </Content>
</template>
