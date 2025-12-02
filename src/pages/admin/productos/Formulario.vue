<script setup>
  import MiModal from "../../../Components/MiModal.vue";
  import { useProductos } from "../../../composables/productos/useProductos";
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

  const { oProducto, limpiarProducto } = useProductos();
  const accion_form = ref(props.accion_formulario);
  const muestra_form = ref(props.muestra_formulario);
  const enviando = ref(false);
  let form = reactive(oProducto.value);
  watch(
    () => props.muestra_formulario,
    (newValue) => {
      muestra_form.value = newValue;
      if (muestra_form.value) {
        cargarListas();
        document.getElementsByTagName("body")[0].classList.add("modal-open");
        form = oProducto.value;
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
      ? `<i class="fa fa-plus"></i> Nuevo Producto`
      : `<i class="fa fa-edit"></i> Editar Producto`;
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
  const imagen = ref(null);
  function cargaArchivo(e, key) {
    form[key] = null;
    form[key] = e.target.files[0];
  }

  const enviarFormulario = () => {
    enviando.value = true;
    let url =
      accion_form.value == 0
        ? "/admin/productos"
        : "/admin/productos/" + form.id;

    const fd = new FormData();
    fd.append("_method", form._method);
    fd.append("codigo", form.codigo);
    fd.append("nombre", form.nombre);
    fd.append("unidades_caja", form.unidades_caja);
    fd.append("descripcion", form.descripcion);
    fd.append("categoria_id", form.categoria_id);
    fd.append("marca_id", form.marca_id);
    fd.append("precio", form.precio);
    fd.append("precio_ppp", form.precio_ppp);
    fd.append("ppp", form.ppp);
    fd.append("unidad_medida_id", form.unidad_medida_id);
    fd.append("estado", form.estado);
    fd.append("imagen", form.imagen);

    api
      .post(url, fd)
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
        limpiarProducto();
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
  const cargarCategorias = () => {
    api.get("/admin/categorias/listado").then((response) => {
      listCategorias.value = response.data.categorias;
    });
  };
  const listMarcas = ref([]);
  const cargarMarcas = () => {
    api.get("/admin/marcas/listado").then((response) => {
      listMarcas.value = response.data.marcas;
    });
  };
  const listUnidadMedidas = ref([]);
  const cargarUnidadMedidas = () => {
    api.get("/admin/unidad_medidas/listado").then((response) => {
      listUnidadMedidas.value = response.data.unidad_medidas;
    });
  };
  const cargarListas = () => {
    cargarCategorias();
    cargarMarcas();
    cargarUnidadMedidas();
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
          <div class="col-md-4 mb-2">
            <label class="required">Código</label>
            <input
              type="text"
              class="form-control"
              :class="{
                'parsley-error': form.errors?.codigo,
              }"
              v-model="form.codigo"
            />
            <ul
              v-if="form.errors?.codigo"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.codigo[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mb-2">
            <label class="required">Nombre de Producto</label>
            <input
              type="text"
              class="form-control"
              :class="{
                'parsley-error': form.errors?.nombre,
              }"
              v-model="form.nombre"
              autosize
            />
            <ul
              v-if="form.errors?.nombre"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.nombre[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mb-2">
            <label class="required">Unidades por caja</label>
            <input
              type="number"
              class="form-control"
              step="1"
              :class="{
                'parsley-error': form.errors?.unidades_caja,
              }"
              v-model="form.unidades_caja"
              autosize
            />
            <ul
              v-if="form.errors?.unidades_caja"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.unidades_caja[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mb-2">
            <label class="">Descripción</label>
            <el-input
              type="textarea"
              :class="{
                'parsley-error': form.errors?.descripcion,
              }"
              v-model="form.descripcion"
              autosize
            ></el-input>
            <ul
              v-if="form.errors?.descripcion"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.descripcion[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mb-2">
            <label class="required">Categoría</label>
            <el-select
              class="w-100"
              :class="{
                'parsley-error': form.errors?.categoria_id,
              }"
              v-model="form.categoria_id"
              placeholder="Seleccione"
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
              v-if="form.errors?.categoria_id"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.categoria_id[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mb-2">
            <label class="required">Marca</label>
            <el-select
              class="w-100"
              :class="{
                'parsley-error': form.errors?.marca_id,
              }"
              v-model="form.marca_id"
              placeholder="Seleccione"
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
              v-if="form.errors?.marca_id"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.marca_id[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mb-2">
            <label class="required">Precio de venta</label>
            <input
              type="number"
              class="form-control"
              step="0.1"
              :class="{
                'parsley-error': form.errors?.precio,
              }"
              v-model="form.precio"
              autosize
            />
            <ul
              v-if="form.errors?.precio"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.precio[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mb-2">
            <label class="required">Unidad de Medida</label>
            <el-select
              class="w-100"
              :class="{
                'parsley-error': form.errors?.unidad_medida_id,
              }"
              v-model="form.unidad_medida_id"
              placeholder="Seleccione"
              filterable
            >
              <el-option
                v-for="item in listUnidadMedidas"
                :key="item.id"
                :value="item.id"
                :label="item.nombre"
              ></el-option>
            </el-select>
            <ul
              v-if="form.errors?.unidad_medida_id"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.unidad_medida_id[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mb-2">
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
            <label>Imagen</label>
            <input
              type="file"
              class="form-control"
              :class="{
                'parsley-error': form.errors?.imagen,
              }"
              ref="imagen"
              @change="cargaArchivo($event, 'imagen')"
            />

            <ul v-if="form.errors?.imagen" class="list-unstyled text-danger">
              <li class="parsley-required">
                {{ form.errors?.imagen[0] }}
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
