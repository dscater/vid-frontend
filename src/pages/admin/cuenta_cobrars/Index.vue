<script setup>
  import Content from "../../../Components/Content.vue";
  import MiTable from "../../../Components/MiTable.vue";
  import { useCuentaCobrars } from "../../../composables/cuenta_cobrars/useCuentaCobrars";
  import { ref, onMounted, onBeforeMount } from "vue";
  import { useAppStore } from "../../../stores/aplicacion/appStore";
  import Formulario from "./Formulario.vue";
  import { useAuthStore } from "../../../stores/authStore";
  import api from "../../../composables/axios.js";
  import { useRouter } from "vue-router";
  import { useCuentaCobrarStore } from "../../../stores/offlineStores/cuentaCobrarStore.js";
  import { useConnectivityStore } from "../../../stores/offlineStores/useConnectivityStore";
  import { useFormater } from "../../../composables/useFormater";
  const { getFormatoMoneda } = useFormater();
  const connectivityStore = useConnectivityStore();
  const cuentaCobrarStore = useCuentaCobrarStore();
  const apiUrl = import.meta.env.VITE_API_URL;
  const authStore = useAuthStore();
  const appStore = useAppStore();
  onBeforeMount(() => {
    appStore.startLoading();
  });

  onMounted(async () => {
    appStore.stopLoading();
    if (!connectivityStore.isOnline) {
      dataOffline.value = await cuentaCobrarStore.getAll();
    }
  });

  const { setCuentaCobrar, limpiarCuentaCobrar } = useCuentaCobrars();

  const dataOffline = ref([]);
  const miTable = ref(null);
  const headers = [
    {
      label: "CÓDIGO ORDEN VENTA",
      key: "orden_venta.codigo",
      sortable: true,
    },
    {
      label: "CLIENTE",
      key: "cliente.razon_social",
      sortable: true,
    },
    {
      label: "TOTAL",
      key: "total",
      sortable: true,
    },
    {
      label: "CANCELADO",
      key: "cancelado",
      sortable: true,
    },
    {
      label: "SALDO",
      key: "saldo",
      sortable: true,
    },
    {
      label: "FECHA",
      key: "fecha_c",
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
    limpiarCuentaCobrar();
    accion_formulario.value = 0;
    muestra_formulario.value = true;
  };
  const registrarPago = async (item) => {
    if (connectivityStore.isOnline) {
      api.get("/admin/cuenta_cobrars/" + item.id).then((response) => {
        setCuentaCobrar(response.data);
        accion_formulario.value = 1;
        muestra_formulario.value = true;
      });
    } else {
      const data = await cuentaCobrarStore.getCuentaCobrarById(
        parseInt(item.id)
      );
      setCuentaCobrar(data);
      accion_formulario.value = 1;
      muestra_formulario.value = true;
    }
  };

  const updateDatatable = async () => {
    if (miTable.value) {
      if (connectivityStore.isOnline) {
        await miTable.value.cargarDatos();
      } else {
        dataOffline.value = await cuentaCobrarStore.getAll();
      }
      muestra_formulario.value = false;
    }
  };

  const eliminarCuentaCobrar = (item) => {
    Swal.fire({
      title: "¿Quierés eliminar este registro?",
      html: `<strong>${item.orden_venta.codigo}</strong>`,
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
        let respuesta = await api.post("/admin/cuenta_cobrars/" + item.id, {
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
          <h1 class="m-0">Cuentas por Cobrar</h1>
        </div>
        <!-- /.col -->
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-right">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'Inicio' }">Inicio</router-link>
            </li>
            <li class="breadcrumb-item active">Cuentas por Cobrar</li>
          </ol>
        </div>
        <!-- /.col -->
      </div>
      <!-- /.row -->
    </template>
    <div class="row">
      <div class="col-md-12">
        <div class="row">
          <!-- <div class="col-md-4">
            <button
              v-if="
                authStore?.user?.permisos == '*' ||
                authStore?.user?.permisos.includes('cuenta_cobrars.create')
              "
              type="button"
              class="btn btn-success"
              @click="agregarRegistro"
            >
              <i class="fa fa-plus"></i> Agregar Nuevo Pago
            </button>
          </div> -->
          <div class="col-md-8 my-1 offset-md-4">
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
              :url="apiUrl + '/admin/cuenta_cobrars/paginado'"
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
              <template #total="{ item }">
                <span>{{ getFormatoMoneda(item.total) }} Bs</span>
              </template>
              <template #cancelado="{ item }">
                <span>{{ getFormatoMoneda(item.cancelado) }} Bs</span>
              </template>
              <template #saldo="{ item }">
                <span>{{ getFormatoMoneda(item.saldo) }} Bs</span>
              </template>

              <template #accion="{ item }">
                <template
                  v-if="
                    authStore?.user?.permisos == '*' ||
                    authStore?.user?.permisos.includes('cuenta_cobrars.create')
                  "
                >
                  <el-tooltip
                    class="box-item"
                    effect="dark"
                    content="Pagos"
                    placement="left-start"
                  >
                    <button
                      class="btn btn-success"
                      @click="registrarPago(item)"
                    >
                      <i class="fa fa-hand-holding-usd"></i></button
                  ></el-tooltip>
                </template>

                <template
                  v-if="
                    item.saldo > 0 &&
                    connectivityStore.isOnline &&
                    (authStore?.user?.permisos == '*' ||
                      authStore?.user?.permisos.includes(
                        'cuenta_cobrars.destroy'
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
                      @click="eliminarCuentaCobrar(item)"
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
              :perPage="20"
              :data="dataOffline"
              :multiSearch="multiSearch"
              :token="authStore.token"
              :syncOrderBy="'id'"
              :syncOrderAsc="'DESC'"
              table-responsive
              :header-class="'bg__primary'"
              fixed-header
            >
              <template #total="{ item }">
                <span>{{ getFormatoMoneda(item.total) }} Bs</span>
              </template>
              <template #cancelado="{ item }">
                <span>{{ getFormatoMoneda(item.cancelado) }} Bs</span>
              </template>
              <template #saldo="{ item }">
                <span>{{ getFormatoMoneda(item.saldo) }} Bs</span>
              </template>
              <template #accion="{ item }">
                <template
                  v-if="
                    authStore?.user?.permisos == '*' ||
                    authStore?.user?.permisos.includes('cuenta_cobrars.create')
                  "
                >
                  <el-tooltip
                    class="box-item"
                    effect="dark"
                    content="Pagos"
                    placement="left-start"
                  >
                    <button
                      class="btn btn-success"
                      @click="registrarPago(item)"
                    >
                      <i class="fa fa-hand-holding-usd"></i></button
                  ></el-tooltip>
                </template>

                <template
                  v-if="
                    connectivityStore.isOnline &&
                    (authStore?.user?.permisos == '*' ||
                      authStore?.user?.permisos.includes(
                        'cuenta_cobrars.destroy'
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
                      @click="eliminarCuentaCobrar(item)"
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
