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
    cliente_id: "todos",
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
      .post("admin/reportes/cuenta_cobrars", form, {
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
          fileLink.setAttribute("download", "cuenta_cobrars.xlsx");
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

  const listClientes = ref([]);
  const cargarClientes = () => {
    api.get("/admin/clientes/listado").then((response) => {
      listClientes.value = response.data.clientes;
      listClientes.value.unshift({
        id: "todos",
        razon_social: "TODOS",
      });
    });
  };
  const cargarListas = () => {
    cargarClientes();
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
          <h1 class="m-0">Reportes > Cuentas por Cobrar</h1>
        </div>
        <!-- /.col -->
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-right">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'Inicio' }">Inicio</router-link>
            </li>
            <li class="breadcrumb-item active">
              Reportes > Cuentas por Cobrar
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
                  <label>Seleccionar Cliente</label>
                  <el-select v-model="form.cliente_id" filterable>
                    <el-option
                      v-for="item in listClientes"
                      :value="item.id"
                      :label="item.razon_social"
                    ></el-option>
                  </el-select>
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
