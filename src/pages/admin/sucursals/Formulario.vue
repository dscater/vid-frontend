<script setup>
  import MiModal from "../../../Components/MiModal.vue";
  import { useSucursals } from "../../../composables/sucursals/useSucursals";
  import { watch, ref, computed, onMounted, nextTick, reactive } from "vue";
  import api from "../../../composables/axios.js";
  const props = defineProps({
    muestra_formulario: {
      type: Boolean,
      default: false,
    },
    accion_formulario: {
      type: Number,
      default: 0,
    },
  });

  const { oSucursal, limpiarSucursal } = useSucursals();
  const accion_form = ref(props.accion_formulario);
  const muestra_form = ref(props.muestra_formulario);
  const enviando = ref(false);
  let form = reactive(oSucursal.value);
  watch(
    () => props.muestra_formulario,
    (newValue) => {
      muestra_form.value = newValue;
      if (muestra_form.value) {
        cargarUsers();
        document.getElementsByTagName("body")[0].classList.add("modal-open");
        form = oSucursal.value;
        form.errors = null;
      } else {
        document.getElementsByTagName("body")[0].classList.remove("modal-open");
      }
    }
  );
  watch(
    () => props.accion_formulario,
    (newValue) => {
      accion_form.value = newValue;
      if (accion_form.value == 0) {
        form["_method"] = "POST";
      }
    }
  );

  const tituloDialog = computed(() => {
    return accion_form.value == 0
      ? `<i class="fa fa-plus"></i> Nueva Sucursal`
      : `<i class="fa fa-edit"></i> Editar Sucursal`;
  });

  const textBtn = computed(() => {
    if (enviando.value) {
      return `<i class="fa fa-spin fa-spinner"></i> Enviando...`;
    }
    if (accion_form.value == 0) {
      return `<i class="fa fa-save"></i> Guardar`;
    }
    return `<i class="fa fa-edit"></i> Actualizar`;
  });

  const enviarFormulario = () => {
    enviando.value = true;
    let url =
      accion_form.value == 0
        ? "/admin/sucursals"
        : "/admin/sucursals/" + form.id;

    api
      .post(url, form)
      .then((response) => {
        console.log(response);

        const success = response.data.message ?? "Proceso realizado con éxito";
        Swal.fire({
          icon: "success",
          title: "Correcto",
          html: `<strong>${success}</strong>`,
          confirmButtonText: `Aceptar`,
          customClass: {
            confirmButton: "btn-success",
          },
        });
        limpiarSucursal();
        emits("envio-formulario");
      })
      .catch((error) => {
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
          const msgError =
            "Ocurrió un error inesperado contactese con el Administrador";
          Swal.fire({
            icon: "info",
            title: "Error",
            html: `<strong>${msgError}</strong>`,
            confirmButtonText: `Aceptar`,
            customClass: {
              confirmButton: "btn-error",
            },
          });
          console.error("Error inesperado:", error);
        }
      })
      .finally(() => {
        enviando.value = false;
      });
  };

  const emits = defineEmits(["cerrar-formulario", "envio-formulario"]);

  watch(muestra_form, (newVal) => {
    if (!newVal) {
      emits("cerrar-formulario");
    }
  });

  const cerrarFormulario = () => {
    muestra_form.value = false;
    document.getElementsByTagName("body")[0].classList.remove("modal-open");
  };
  const listUsers = ref([]);
  const cargarUsers = () => {
    api
      .get("/admin/usuarios/listado", {
        params: {
          usuarios: true,
        },
      })
      .then((response) => {
        listUsers.value = response.data.usuarios;
      });
  };

  onMounted(() => {});
</script>

<template>
  <MiModal
    :open_modal="muestra_form"
    @close="cerrarFormulario"
    :size="'modal-xl'"
    :header-class="'bg-navy'"
    :footer-class="'justify-content-end'"
  >
    <template #header>
      <h4 class="modal-title text-white" v-html="tituloDialog"></h4>
      <button type="button" class="close" @click.prevent="cerrarFormulario()">
        <span aria-hidden="true">×</span>
      </button>
    </template>

    <template #body>
      <form @submit.prevent="enviarFormulario()">
        <p class="text-muted text-xs mb-0">
          Todos los campos con
          <span class="text-danger">(*)</span> son obligatorios.
        </p>
        <div class="row">
          <div class="col-md-4 mt-2">
            <label class="required">Nombre de Sucursal</label>
            <el-input
              type="text"
              :class="{
                'parsley-error': form.errors?.nombre,
              }"
              v-model="form.nombre"
              autosize
            ></el-input>
            <ul
              v-if="form.errors?.nombre"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.nombre[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mt-2">
            <label class="required">Dirección Completa</label>
            <el-input
              type="text"
              :class="{
                'parsley-error': form.errors?.direccion,
              }"
              v-model="form.direccion"
              autosize
            ></el-input>
            <ul
              v-if="form.errors?.direccion"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.direccion[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mt-2">
            <label class="required">Teléfono</label>
            <el-input
              type="text"
              :class="{
                'parsley-error': form.errors?.fono,
              }"
              v-model="form.fono"
              autosize
            ></el-input>
            <ul
              v-if="form.errors?.fono"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.fono[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mt-2">
            <label>Correo electrónico</label>
            <el-input
              type="text"
              :class="{
                'parsley-error': form.errors?.correo,
              }"
              v-model="form.correo"
              autosize
            ></el-input>
            <ul
              v-if="form.errors?.correo"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.correo[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mt-2">
            <label class="required">Encargado de Sucursal</label>
            <el-select
              :class="{
                'parsley-error': form.errors?.user_id,
              }"
              v-model="form.user_id"
              placeholder="Seleccionar"
              filterable
            >
              <el-option
                v-for="item in listUsers"
                :key="item.id"
                :value="item.id"
                :label="item.full_name"
              >
              </el-option>
            </el-select>
            <ul
              v-if="form.errors?.user_id"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.user_id[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mt-2">
            <label class="required">Estado</label><br />
            <el-switch
              size="large"
              v-model="form.estado"
              class="mb-2"
              style="
                --el-switch-on-color: #13ce66;
                --el-switch-off-color: #ff4949;
              "
              active-text="Habilitado"
              inactive-text="Deshabilitado"
              :active-value="1"
              :inactive-value="0"
            />
            <ul v-if="form.errors?.estado" class="list-unstyled text-danger">
              <li class="parsley-required">
                {{ form.errors?.estado[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mt-2">
            <label class="required">Maximo ventas diario</label>
            <input
              type="number"
              step="0.1"
              class="form-control"
              :class="{
                'parsley-error': form.errors?.monto_dia,
              }"
              v-model="form.monto_dia"
              placeholder="Seleccionar"
              filterable
            />
            <ul
              v-if="form.errors?.monto_dia"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.monto_dia[0] }}
              </li>
            </ul>
          </div>
        </div>
      </form>
    </template>
    <template #footer>
      <button
        type="button"
        class="btn btn-default"
        @click.prevent="cerrarFormulario()"
      >
        Cerrar
      </button>
      <button
        type="button"
        class="btn btn-success"
        :disabled="enviando"
        @click.prevent="enviarFormulario"
        v-html="textBtn"
      ></button>
    </template>
  </MiModal>
</template>
