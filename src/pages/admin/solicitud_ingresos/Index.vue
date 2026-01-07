<script setup>
  import Content from "../../../Components/Content.vue";
  import MiTable from "../../../Components/MiTable.vue";
  import { useSolicitudIngresos } from "../../../composables/solicitud_ingresos/useSolicitudIngresos";
  import { ref, onMounted, onBeforeMount } from "vue";
  import { useAppStore } from "../../../stores/aplicacion/appStore";
  import Formulario from "./Formulario.vue";
  import Detalles from "./Detalles.vue";
  import MostrarDetalles from "./MostrarDetalles.vue";
  import { useAuthStore } from "../../../stores/authStore";
  import api from "../../../composables/axios.js";
  import { useRouter } from "vue-router";
  import { useFormater } from "../../../composables/useFormater";
  const { getFormatoMoneda } = useFormater();
  const apiUrl = import.meta.env.VITE_API_URL;
  const authStore = useAuthStore();
  const appStore = useAppStore();
  onBeforeMount(() => {
    appStore.startLoading();
  });

  onMounted(() => {
    appStore.stopLoading();
  });

  const { setSolicitudIngreso, limpiarSolicitudIngreso } =
    useSolicitudIngresos();

  const miTable = ref(null);
  const headers = [
    {
      label: "CÓDIGO",
      key: "codigo",
      sortable: true,
      width: "4%",
    },
    {
      label: "PROVEEDOR",
      key: "proveedor.razon_social",
      sortable: true,
    },
    {
      label: "CANTIDAD TOTAL",
      key: "cantidad_total",
      sortable: true,
    },
    {
      label: "MONTO TOTAL",
      key: "total",
      sortable: true,
    },
    {
      label: "FECHA",
      key: "fecha_c",
      sortable: true,
    },
    {
      label: "FACTURA",
      key: "cs_f",
      sortable: true,
    },
    {
      label: "USUARIO",
      key: "user",
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
    limpiarSolicitudIngreso();
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

  const editarSolicitudIngreso = (item) => {
    api.get("/admin/solicitud_ingresos/" + item.id).then((response) => {
      setSolicitudIngreso(response.data.solicitud_ingreso);
      accion_formulario.value = 1;
      muestra_formulario.value = true;
    });
  };

  const accion_formulario_detalle = ref(0);
  const muestra_formulario_detalle = ref(false);
  const aprobarSolicitudIngreso = (item) => {
    api.get("/admin/solicitud_ingresos/" + item.id).then((response) => {
      setSolicitudIngreso(response.data.solicitud_ingreso);
      accion_formulario_detalle.value = 1;
      muestra_formulario_detalle.value = true;
    });
  };

  const accion_formulario_mostrardetalle = ref(0);
  const muestra_formulario_mostrardetalle = ref(false);
  const muestraDetalles = (item) => {
    api.get("/admin/solicitud_ingresos/" + item.id).then((response) => {
      setSolicitudIngreso(response.data.solicitud_ingreso);
      accion_formulario_mostrardetalle.value = 1;
      muestra_formulario_mostrardetalle.value = true;
    });
  };

  const eliminarSolicitudIngreso = (item) => {
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
        let respuesta = await api.post("/admin/solicitud_ingresos/" + item.id, {
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
          <h1 class="m-0">Solicitud de Ingreso</h1>
        </div>
        <!-- /.col -->
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-right">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'Inicio' }">Inicio</router-link>
            </li>
            <li class="breadcrumb-item active">Solicitud de Ingreso</li>
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
                authStore?.user?.permisos.includes('solicitud_ingresos.create')
              "
              type="button"
              class="btn btn-success"
              @click="agregarRegistro"
            >
              <i class="fa fa-plus"></i> Nueva Solicitud de Ingreso
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
              :url="apiUrl + '/admin/solicitud_ingresos/paginado'"
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

              <template #total="{ item }">
                <span
                  class="badge text-sm"
                  :class="{
                    'text-muted bg10': item.verificado != 3,
                    'bg-success': item.verificado == 3,
                  }"
                  >{{ getFormatoMoneda(item.total) }} Bs</span
                >
              </template>

              <template #accion="{ item }">
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  :content="`Detalles`"
                  placement="left-start"
                >
                  <button
                    class="btn btn-primary"
                    @click="muestraDetalles(item)"
                  >
                    <i class="fa fa-list"></i></button
                ></el-tooltip>
                <el-tooltip
                  v-if="
                    item.verificado == 0 &&
                    (authStore?.user?.permisos == '*' ||
                      authStore?.user?.permisos.includes(
                        'solicitud_ingresos.aprobar'
                      ))
                  "
                  class="box-item"
                  effect="dark"
                  :content="`Aprobar Cantidad`"
                  placement="left-start"
                >
                  <button
                    class="btn btn-success"
                    @click="aprobarSolicitudIngreso(item)"
                  >
                    <i class="fa fa-clipboard"></i></button
                ></el-tooltip>
                <el-tooltip
                  v-if="
                    (item.verificado == 1 || item.verificado == 2) &&
                    (authStore?.user?.permisos == '*' ||
                      authStore?.user?.permisos.includes(
                        'solicitud_ingresos.aprobar_costos'
                      ))
                  "
                  class="box-item"
                  effect="dark"
                  :content="`Aprobar Costos`"
                  placement="left-start"
                >
                  <button
                    class="btn btn-info"
                    @click="aprobarSolicitudIngreso(item)"
                  >
                    <i class="fa fa-clipboard-list"></i></button
                ></el-tooltip>
                <template
                  v-if="
                    item.verificado == 0 &&
                    (authStore?.user?.permisos == '*' ||
                      authStore?.user?.permisos.includes(
                        'solicitud_ingresos.edit'
                      ))
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
                      @click="editarSolicitudIngreso(item)"
                    >
                      <i class="fa fa-pen"></i></button
                  ></el-tooltip>

                  <template
                    v-if="
                      item.verificado == 0 &&
                      (authStore?.user?.permisos == '*' ||
                        authStore?.user?.permisos.includes(
                          'solicitud_ingresos.destroy'
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
                        @click="eliminarSolicitudIngreso(item)"
                      >
                        <i class="fa fa-trash-alt"></i></button
                    ></el-tooltip>
                  </template>
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
    <MostrarDetalles
      :muestra_formulario="muestra_formulario_mostrardetalle"
      :accion_formulario="accion_formulario_mostrardetalle"
      @envio-formulario="updateDatatable"
      @cerrar-formulario="muestra_formulario_mostrardetalle = false"
    ></MostrarDetalles>
  </Content>
</template>
