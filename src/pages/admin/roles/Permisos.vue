<script setup>
  import Content from "../../../Components/Content.vue";
  import { useAppStore } from "../../../stores/aplicacion/appStore";
  import { ref, onMounted, onBeforeMount } from "vue";
  // TOAST
  import { toast } from "vue3-toastify";
  import "vue3-toastify/dist/index.css";
  import api from "../../../composables/axios";
  const appStore = useAppStore();
  onBeforeMount(() => {
    appStore.startLoading();
  });
  const props = defineProps({
    id: {
      type: String,
      default: "",
    },
  });

  const role = ref(null);
  const modulos_group = ref([]);
  const array_modulos = ref(null);
  const array_permisos = ref(null);

  const listPermisos = ref([]);

  const cargarRole = (params = {}) => {
    api.get("/admin/roles/" + props.id, { params }).then((response) => {
      role.value = response.data.role;
      modulos_group.value = response.data.modulos_group;
      array_modulos.value = response.data.array_modulos;
      array_permisos.value = response.data.array_permisos;
      listPermisos.value = array_permisos.value;
    });
  };

  const verificaDisabled = (modulo, accion) => {
    let disabled = false;
    if (role.value.id == 1) {
      disabled = true;
    }
    if (role.value.id != 2) {
      if (modulo == "Solicitud de productos") {
        if (accion == "CREAR") {
          disabled = true;
        }
      }
      if (modulo == "Orden de venta") {
        if (accion == "CREAR") {
          disabled = true;
        }
      }
    }
    return disabled;
  };

  const verificaPermiso = (modulo, accion) => {
    let existe = listPermisos.value[modulo].filter(
      (elem) => elem.accion == accion
    );

    if (existe.length > 0) {
      // console.log(modulo, accion, "existe");
      return true;
    }
    // console.log(modulo, accion, "no existe");
    return false;
  };

  const actualizaPermiso = (e, modulo, accion) => {
    const checked = e.target.checked ? 1 : 0;
    let listPermisosBK = listPermisos.value;
    api
      .post("/admin/roles/actualizaPermiso/" + role.value.id, {
        sw_cambio: checked,
        modulo: modulo,
        accion: accion,
      })
      .then((response) => {
        // console.log(response);
        toast.success("Operación completada correctamente!");
        listPermisos.value[modulo] = response.data.array_permisos;
      })
      .catch((error) => {
        listPermisos.value[modulo] = listPermisosBK;
        if (
          error.response &&
          error.response.data &&
          error.response.data.errors
        ) {
          const msgError =
            "Existen errores en el formulario, por favor verifique";
          Swal.fire({
            icon: "info",
            title: "Error",
            html: `<strong>${msgError}</strong>`,
            confirmButtonText: `Aceptar`,
            customClass: {
              confirmButton: "btn-error",
            },
          });
          form.errors = error.response.data.errors;
        } else {
          toast.error(
            "No se pudo actualizar la información debido a un error, intenté mas tarde"
          );
          console.error("Error inesperado:", error);
        }
      })
      .finally(() => {
        // enviando.value = false;
      });
  };

  const permisosAsignados = ref(false);
  const muestraSoloAsignados = () => {
    permisosAsignados.value = !permisosAsignados.value;
    let params = {};
    if (permisosAsignados.value) {
      params = {
        activos: true,
      };
    }

    cargarRole(params);
  };
  onMounted(() => {
    cargarRole();
    appStore.stopLoading();
  });
</script>
<template>
  <Content>
    <template #header>
      <div class="row mb-2">
        <div class="col-sm-6">
          <h1 class="m-0">Roles > Permisos</h1>
        </div>
        <!-- /.col -->
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-right">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'Inicio' }">Inicio</router-link>
            </li>
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'roles.index' }">Roles</router-link>
            </li>
            <li class="breadcrumb-item active">Permisos</li>
          </ol>
        </div>
        <!-- /.col -->
      </div>
      <!-- /.row -->
    </template>
    <div class="row">
      <div class="col-md-3 mb-2">
        <router-link
          :to="{ name: 'roles.index' }"
          class="btn btn-default d-inline-block w-100"
        >
          <i class="fa fa-arrow-left"></i> Volver
        </router-link>
      </div>
      <div class="col-md-12">
        <!-- BEGIN card -->
        <div class="card">
          <!-- BEGIN card-body -->
          <div class="card-body p-2 overflow-auto p-0">
            <div class="row w-100 m-0">
              <div class="col-12">
                <h3>{{ role?.nombre }}</h3>
                <button
                  class="btn btn-sm btn-outline-primary mb-2"
                  @click.prevent="muestraSoloAsignados"
                >
                  Permisos asignados
                  <i
                    :class="{
                      'far fa-square': !permisosAsignados,
                      'fa fa-check-square': permisosAsignados,
                    }"
                  ></i>
                </button>
              </div>
              <div
                class="col-12 fila_seccion p-0"
                v-for="item in modulos_group"
              >
                <p class="font-weight-bold mb-2 nomModulo">
                  {{ item }}
                </p>
                <div class="row mb-3 px-3">
                  <div
                    v-if="!permisosAsignados"
                    class="col-md-3"
                    v-for="item_permiso in array_modulos[item]"
                  >
                    <label class="check_permiso">
                      {{ item_permiso.accion }}
                      <input
                        type="checkbox"
                        :checked="verificaPermiso(item, item_permiso.accion)"
                        @change="
                          actualizaPermiso($event, item, item_permiso.accion)
                        "
                        :disabled="verificaDisabled(item, item_permiso.accion)"
                        verificaPermiso
                      />
                    </label>
                  </div>
                  <div
                    v-else
                    class="col-md-3"
                    v-for="item_permiso in array_modulos[item]"
                  >
                    <label
                      class="check_permiso"
                      v-if="verificaPermiso(item, item_permiso.accion)"
                    >
                      {{ item_permiso.accion }}
                      <input
                        type="checkbox"
                        :checked="verificaPermiso(item, item_permiso.accion)"
                        @change="
                          actualizaPermiso($event, item, item_permiso.accion)
                        "
                        :disabled="verificaDisabled(item, item_permiso.accion)"
                        verificaPermiso
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- END card-body -->
        </div>
        <!-- END card -->
      </div>
    </div>
  </Content>
</template>
<style>
  .nomModulo {
    font-size: 1.1em;
    background-color: var(--bg6);
    padding-left: 10px;
  }
  .nomModulo.bg-principal {
    background-color: var(--bg3);
  }
  .fila_seccion {
    margin-bottom: 15px;
    box-shadow: 0px 2px 3px black, 2px 0px 3px black;
  }

  .check_permiso {
    display: flex;
    justify-content: start;
    align-items: center;
    gap: 4px;
    padding: 5px;
    cursor: pointer;
    font-size: 0.8em;
    padding: 10px;
  }

  .check_permiso:hover {
    background-color: beige;
  }
  .check_permiso input {
    cursor: pointer;
    font-size: 20px;
    height: 18px;
    width: 18px;
    margin-bottom: 3px;
  }

  input:disabled {
    cursor: not-allowed;
  }
</style>
