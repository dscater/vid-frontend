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
  const form = reactive({
    tipo: "pdf",
    tipo_cliente: "todos",
    estado: "todos",
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
      .post("admin/reportes/clientes", form, {
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
          fileLink.setAttribute("download", "clientes.xlsx");
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

  const listTipo = ref([
    {
      value: "todos",
      label: "TODOS",
    },
    {
      value: "PERSONA",
      label: "PERSONA",
    },
    {
      value: "EMPRESA",
      label: "EMPRESA",
    },
  ]);
  const listEstado = ref([
    {
      value: "todos",
      label: "TODOS",
    },
    {
      value: 1,
      label: "ACTIVO",
    },
    {
      value: 0,
      label: "INACTIVO",
    },
  ]);
  const cargarListas = () => {};

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
          <h1 class="m-0">Reportes > Lista de Clientes</h1>
        </div>
        <!-- /.col -->
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-right">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'Inicio' }">Inicio</router-link>
            </li>
            <li class="breadcrumb-item active">Reportes > Lista de Clientes</li>
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
                  <label>Seleccionar Tipo de Cliente</label>
                  <select v-model="form.tipo_cliente" class="form-control">
                    <option v-for="item in listTipo" :value="item.value">
                      {{ item.label }}
                    </option>
                  </select>
                </div>
                <div class="col-md-12">
                  <label>Seleccionar Estado</label>
                  <select v-model="form.estado" class="form-control">
                    <option v-for="item in listEstado" :value="item.value">
                      {{ item.label }}
                    </option>
                  </select>
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
