<script setup>
  import Content from "../../../Components/Content.vue";
  import MiTable from "../../../Components/MiTable.vue";
  import { useAjustes } from "../../../composables/ajustes/useAjustes";
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

  const { setAjuste, limpiarAjuste } = useAjustes();

  const miTable = ref(null);
  const headers = [
    {
      label: "",
      key: "id",
      sortable: true,
      width: "4%",
    },
    {
      label: "CÓDIGO PRODUCTO",
      key: "producto.codigo",
      keySortable: "productos.codigo",
      sortable: true,
    },
    {
      label: "NOMBRE PRODUCTO",
      key: "producto.nombre",
      keySortable: "productos.nombre",
      sortable: true,
    },
    {
      label: "CANTIDAD",
      key: "cantidad",
      sortable: true,
    },
    {
      label: "ESTADO",
      key: "estado",
      sortable: true,
    },
    {
      label: "MOTIVO",
      key: "motivo",
      sortable: true,
    },
    {
      label: "TIPO DE MOVIMIENTO",
      key: "tipo",
      sortable: true,
    },
    {
      label: "CÓDIGO DE MOVIMIENTO",
      key: "codigo",
      sortable: true,
    },
    {
      label: "REPONIENDO EL AJUSTE",
      key: "nom_sucursal",
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
    limpiarAjuste();
    accion_formulario.value = 0;
    muestra_formulario.value = true;
  };

  const updateDatatable = async () => {
    if (miTable.value) {
      await miTable.value.cargarDatos();
      muestra_formulario.value = false;
    }
  };

  const eliminarAjuste = (item) => {
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
        let respuesta = await api.post("/admin/ajustes/" + item.id, {
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
          <h1 class="m-0">Ajustes</h1>
        </div>
        <!-- /.col -->
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-right">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'Inicio' }">Inicio</router-link>
            </li>
            <li class="breadcrumb-item active">Ajustes</li>
          </ol>
        </div>
        <!-- /.col -->
      </div>
      <!-- /.row -->
    </template>
    <div class="row">
      <div class="col-md-12">
        <div class="row">
          <div class="col-md-4"></div>
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
              :url="apiUrl + '/admin/ajustes/paginado'"
              :numPages="5"
              :perPage="20"
              :multiSearch="multiSearch"
              :token="authStore.token"
              :syncOrderBy="'id'"
              :syncOrderAsc="'DESC'"
              table-responsive
              :header-class="'bg__primary'"
              fixed-header
            >
              <template #cantidad="{ item }">
                <div>
                  <span v-if="item.cantidad < 0">
                    {{ item.cantidad }}
                    <span class="badge badge-success">MAS</span>
                  </span>
                  <span v-else>
                    {{ item.cantidad }}
                    <span class="badge badge-danger">MENOS</span>
                  </span>
                </div>
              </template>
              <template #sucursal="{ item }">
                <div>
                  <span>
                    {{ item.sucursal_nom }}
                  </span>
                </div>
              </template>
              <template #accion="{ item }">
                <template
                  v-if="
                    item.estado == 'NO REPUESTO' &&
                    (authStore?.user?.permisos == '*' ||
                      authStore?.user?.permisos.includes('ajustes.edit'))
                  "
                >
                  <el-tooltip
                    class="box-item"
                    effect="dark"
                    content="Reponer"
                    placement="left-start"
                  >
                    <button
                      class="btn btn-warning"
                      @click="
                        setAjuste(item);
                        accion_formulario = 1;
                        muestra_formulario = true;
                      "
                    >
                      <i class="fa fa-sync"></i></button
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
