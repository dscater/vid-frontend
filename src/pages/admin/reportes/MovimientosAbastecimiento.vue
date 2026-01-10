<script setup>
  import Content from "../../../components/Content.vue";
  import { ref, onMounted, onBeforeMount, computed, reactive } from "vue";
  import { useAppStore } from "../../../stores/aplicacion/appStore";
  import { useAuthStore } from "../../../stores/authStore";
  import api from "../../../composables/axios";
  const apiUrl = import.meta.env.VITE_API_URL;
  const authStore = useAuthStore();
  const appStore = useAppStore();

  onBeforeMount(() => {
    appStore.startLoading();
  });

  const getFechaAtual = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const form = reactive({
    tipo: "pdf",
    sucursal_id: "todos",
    producto_id: "todos",
    unidad_medida_id: "todos",
    fecha_ini: getFechaAtual(),
    fecha_fin: getFechaAtual(),
    errors: null,
  });

  const listTipos = ref([
    {
      value: "pdf",
      label: "PDF",
    },
    {
      value: "excel",
      label: "EXCEL",
    },
  ]);

  const generando = ref(false);
  const txtBtn = computed(() => {
    if (generando.value) {
      return "Generando Reporte...";
    }
    return "Generar Reporte";
  });

  const generarReporte = () => {
    generando.value = true;
    api
      .post("admin/reportes/movimientos_abastecimiento", form, {
        responseType: "blob",
      })
      .then((response) => {
        form.errors = [];
        if (form.tipo == "pdf") {
          const pdfBlob = new Blob([response.data], {
            type: "application/pdf",
          });
          const urlReporte = URL.createObjectURL(pdfBlob);
          window.open(urlReporte, "_blank");
        } else {
          const fileURL = window.URL.createObjectURL(new Blob([response.data]));
          const fileLink = document.createElement("a");
          fileLink.href = fileURL;
          fileLink.setAttribute("download", "movimientos_abastecimiento.xlsx");
          document.body.appendChild(fileLink);
          fileLink.click();
        }
      })
      .catch(async (error) => {
        let responseObj = await error.response.data.text();
        responseObj = JSON.parse(responseObj);
        if (error.response) {
          if (error.response.status == 422) {
            form.errors = responseObj.errors;
          } else {
            console.log(error);
            Swal.fire({
              icon: "info",
              title: "Error",
              html: `<strong>Ocurrió un error al generar el reporte intente mas tarde</strong>`,
              confirmButtonText: `Aceptar`,
              customClass: {
                confirmButton: "btn-error",
              },
            });
          }
        }
      })
      .finally(() => {
        generando.value = false;
      });
  };

  const listSucursals = ref([]);
  const cargarSucursals = () => {
    api.get("/admin/sucursals/listado").then((response) => {
      listSucursals.value = response.data.sucursals;
      listSucursals.value.unshift({
        id: "todos",
        nombre: "TODOS",
      });
    });
  };

  const listUnidadMedidas = ref([]);
  const cargarUnidadMedidas = () => {
    api.get("/admin/unidad_medidas/listado").then((response) => {
      listUnidadMedidas.value = response.data.unidad_medidas;
      listUnidadMedidas.value.unshift({
        id: "todos",
        nombre: "TODOS",
      });
    });
  };

  const listProductos = ref([]);
  const cargarProductos = () => {
    api.get("/admin/productos/listado").then((response) => {
      listProductos.value = response.data.productos;
      listProductos.value.unshift({
        id: "todos",
        nombre: "TODOS",
      });
    });
  };
  const cargarListas = () => {
    cargarSucursals();
    cargarUnidadMedidas();
    cargarProductos();
  };

  onMounted(async () => {
    cargarListas();
    appStore.stopLoading();
  });
</script>
<template>
  <Content>
    <template #header>
      <div class="row mb-2">
        <div class="col-sm-6">
          <h1 class="m-0">
            Reportes > Semanal de Movimientos y Abastecimiento
          </h1>
        </div>
        <!-- /.col -->
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-right">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'Inicio' }">Inicio</router-link>
            </li>
            <li class="breadcrumb-item active">
              Reportes > Semanal de Movimientos y Abastecimiento
            </li>
          </ol>
        </div>
        <!-- /.col -->
      </div>
      <!-- /.row -->
    </template>
    <div class="row">
      <div class="col-md-6 mx-auto">
        <div class="card">
          <div class="card-body">
            <form @submit.prevent="generarReporte">
              <div class="row">
                <div class="col-md-12">
                  <label>Tipo Reporte</label>
                  <select v-model="form.tipo" class="form-control">
                    <option v-for="item in listTipos" :value="item.value">
                      {{ item.label }}
                    </option>
                  </select>
                </div>
                <div class="col-md-12">
                  <label>Seleccionar Sucursal/Vehículo</label>
                  <el-select v-model="form.sucursal_id" filterable>
                    <el-option
                      v-for="item in listSucursals"
                      :value="item.id"
                      :label="item.nombre"
                    ></el-option>
                  </el-select>
                </div>
                <div class="col-md-12">
                  <label>Seleccionar Unidad</label>
                  <el-select v-model="form.unidad_medida_id" filterable>
                    <el-option
                      v-for="item in listUnidadMedidas"
                      :value="item.id"
                      :label="item.nombre"
                    ></el-option>
                  </el-select>
                </div>
                <div class="col-md-12">
                  <label>Seleccionar Producto</label>
                  <el-select v-model="form.producto_id" filterable>
                    <el-option
                      v-for="item in listProductos"
                      :value="item.id"
                      :label="item.nombre"
                    ></el-option>
                  </el-select>
                </div>
                <div class="col-md-12">
                  <label>Fecha</label>
                  <div class="row">
                    <div class="col-md-6">
                      <input
                        type="date"
                        v-model="form.fecha_ini"
                        class="form-control"
                      />
                    </div>
                    <div class="col-md-6">
                      <input
                        type="date"
                        v-model="form.fecha_fin"
                        class="form-control"
                      />
                    </div>
                  </div>
                </div>
                <div class="col-md-12 text-center mt-3">
                  <button
                    class="btn btn-success"
                    block
                    @click="generarReporte"
                    :disabled="generando"
                    v-text="txtBtn"
                  ></button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </Content>
</template>
