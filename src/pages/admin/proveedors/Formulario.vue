<script setup>
  import MiModal from "../../../Components/MiModal.vue";
  import { useProveedors } from "../../../composables/proveedors/useProveedors";
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

  const { oProveedor, limpiarProveedor } = useProveedors();
  const accion_form = ref(props.accion_formulario);
  const muestra_form = ref(props.muestra_formulario);
  const enviando = ref(false);
  let form = reactive(oProveedor.value);
  watch(
    () => props.muestra_formulario,
    (newValue) => {
      muestra_form.value = newValue;
      if (muestra_form.value) {
        cargarListas();
        document.getElementsByTagName("body")[0].classList.add("modal-open");
        form = oProveedor.value;
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
      ? `<i class="fa fa-plus"></i> Nuevo Proveedor`
      : `<i class="fa fa-edit"></i> Editar Proveedor`;
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
        ? "/admin/proveedors"
        : "/admin/proveedors/" + form.id;

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
        limpiarProveedor();
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

  const listCategorias = ref([]);
  const listMarcas = ref([]);
  const cargarCategorias = () => {
    api.get("/admin/categorias/listado").then((response) => {
      listCategorias.value = response.data.categorias;
    });
  };
  const cargarMarcas = () => {
    api.get("/admin/marcas/listado").then((response) => {
      listMarcas.value = response.data.marcas;
    });
  };

  const cargarListas = () => {
    cargarCategorias();
    cargarMarcas();
  };

  const agregarContacto = () => {
    form.contactos.push({ nombre: "", fono: "", cel: "", observacion: "" });
  };

  const eliminarContacto = (index) => {
    form.contactos.splice(index, 1);
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
          <div class="col-12">
            <h4>DATOS DEL PROVEEDOR</h4>
          </div>
          <div class="col-md-4 mb-2">
            <label class="required">Razón Social</label>
            <el-input
              type="text"
              :class="{
                'parsley-error': form.errors?.razon_social,
              }"
              v-model="form.razon_social"
              autosize
            ></el-input>
            <ul
              v-if="form.errors?.razon_social"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.razon_social[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mb-2">
            <label>Nombre comercial</label>
            <el-input
              type="text"
              :class="{
                'parsley-error': form.errors?.nombre_com,
              }"
              v-model="form.nombre_com"
              autosize
            ></el-input>
            <ul
              v-if="form.errors?.nombre_com"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.nombre_com[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mb-2">
            <label class="required">NIT</label>
            <el-input
              type="text"
              :class="{
                'parsley-error': form.errors?.nit,
              }"
              v-model="form.nit"
              autosize
            ></el-input>
            <ul
              v-if="form.errors?.nit"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.nit[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mb-2">
            <label class="required">Moneda de Transacción</label>
            <el-input
              type="text"
              :class="{
                'parsley-error': form.errors?.moneda,
              }"
              v-model="form.moneda"
              autosize
            ></el-input>
            <ul
              v-if="form.errors?.moneda"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.moneda[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mb-2">
            <label class="required">Teléfono de empresa</label>
            <el-input
              type="text"
              :class="{
                'parsley-error': form.errors?.fono_emp,
              }"
              v-model="form.fono_emp"
              autosize
            ></el-input>
            <ul
              v-if="form.errors?.fono_emp"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.fono_emp[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mb-2">
            <label class="required">Correo electrónico</label>
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
          <div class="col-md-4 mb-2">
            <label class="required">Dirección completa</label>
            <input
              type="text"
              class="form-control"
              :class="{
                'parsley-error': form.errors?.dir,
              }"
              v-model="form.dir"
            />
            <ul
              v-if="form.errors?.dir"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.dir[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mb-2">
            <label class="required">Ciudad</label>
            <el-input
              type="text"
              :class="{
                'parsley-error': form.errors?.ciudad,
              }"
              v-model="form.ciudad"
              autosize
            ></el-input>
            <ul
              v-if="form.errors?.ciudad"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.ciudad[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mb-2">
            <label class="required">Tipo de Proveedor</label>
            <select
              class="form-control"
              :class="{
                'parsley-error': form.errors?.tipo,
              }"
              v-model="form.tipo"
            >
              <option value="PRODUCTOS">PRODUCTOS</option>
              <option value="SERVICIOS">SERVICIOS</option>
              <option value="MIXTO">MIXTO</option>
            </select>
            <ul
              v-if="form.errors?.tipo"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.tipo[0] }}
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
          <div class="col-md-4 mb-2">
            <label>Observaciones</label>
            <el-input
              type="textarea"
              :class="{
                'parsley-error': form.errors?.observaciones,
              }"
              v-model="form.observaciones"
              autosize
            ></el-input>
            <ul
              v-if="form.errors?.observaciones"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.observaciones[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mb-2">
            <label class="required">Seleccionar Categorías</label>
            <el-select
              type="textarea"
              :class="{
                'parsley-error': form.errors?.categorias,
              }"
              v-model="form.categorias"
              autosize
              placeholder="Seleccione"
              multiple
              filterable
            >
              <el-option
                v-for="item in listCategorias"
                :key="item.id"
                :value="item.id"
                :label="item.nombre"
              ></el-option>
            </el-select>
            <ul
              v-if="form.errors?.categorias"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.categorias[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mb-2">
            <label class="required">Seleccionar Marcas</label>
            <el-select
              type="textarea"
              :class="{
                'parsley-error': form.errors?.marcas,
              }"
              v-model="form.marcas"
              autosize
              placeholder="Seleccione"
              multiple
              filterable
            >
              <el-option
                v-for="item in listMarcas"
                :key="item.id"
                :value="item.id"
                :label="item.nombre"
              ></el-option>
            </el-select>
            <ul
              v-if="form.errors?.marcas"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.marcas[0] }}
              </li>
            </ul>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <h4>
              DATOS DEL CONTACTO
              <button
                class="btn btn-sm btn-success"
                @click.prevent="agregarContacto"
              >
                <i class="fa fa-plus"></i>
              </button>
            </h4>
          </div>
          <div class="col-12" v-for="(item, index) in form.contactos">
            <div class="row fila_contacto">
              <button
                v-if="index != 0 || form.contactos.length > 1"
                class="btn btn-sm btn-danger btnEliminar"
                @click.prevent="eliminarContacto(index)"
              >
                X
              </button>
              <div class="col-md-3 mb-2">
                <label class="required">Nombre Completo Contacto</label>
                <input type="text" class="form-control" v-model="item.nombre" />
              </div>
              <div class="col-md-3 mb-2">
                <label class="required">Teléfono de Corporativo</label>
                <input type="text" class="form-control" v-model="item.fono" />
              </div>
              <div class="col-md-3 mb-2">
                <label class="required">Celular</label>
                <input type="text" class="form-control" v-model="item.cel" />
              </div>
              <div class="col-md-3 mb-2">
                <label>Observaciones</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="item.observacion"
                />
              </div>
            </div>
          </div>
          <div class="col-12">
            <ul v-if="form.errors?.contactos" class="list-unstyled text-danger">
              <li class="parsley-required">
                {{ form.errors?.contactos[0] }}
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
<style scoped>
  .fila_contacto {
    position: relative;
    margin-top: 10px;
  }
  .btnEliminar {
    font-size: 0.6em;
    top: -16px;
    left: 0;
    position: absolute;
  }
</style>
