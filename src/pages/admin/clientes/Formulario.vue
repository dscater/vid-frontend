<script setup>
  import MiModal from "../../../Components/MiModal.vue";
  import { useClientes } from "../../../composables/clientes/useClientes";
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

  const { oCliente, limpiarCliente } = useClientes();
  const accion_form = ref(props.accion_formulario);
  const muestra_form = ref(props.muestra_formulario);
  const enviando = ref(false);
  let form = reactive(oCliente.value);
  watch(
    () => props.muestra_formulario,
    (newValue) => {
      muestra_form.value = newValue;
      if (muestra_form.value) {
        document.getElementsByTagName("body")[0].classList.add("modal-open");
        form = oCliente.value;
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
      ? `<i class="fa fa-plus"></i> Nuevo Cliente`
      : `<i class="fa fa-edit"></i> Editar Cliente`;
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
      accion_form.value == 0 ? "/admin/clientes" : "/admin/clientes/" + form.id;

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
        limpiarCliente();
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
            <h4>DATOS DEL CLIENTE</h4>
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
            <label class="required">Tipo de Cliente</label>
            <select
              class="form-control"
              :class="{
                'parsley-error': form.errors?.tipo,
              }"
              v-model="form.tipo"
            >
              <option value="PERSONA">PERSONA</option>
              <option value="EMPRESA">EMPRESA</option>
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
            <label class="required">Nombre Punto de Venta</label>
            <el-input
              type="text"
              :class="{
                'parsley-error': form.errors?.nombre_punto,
              }"
              v-model="form.nombre_punto"
              autosize
            ></el-input>
            <ul
              v-if="form.errors?.nombre_punto"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.nombre_punto[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mb-2">
            <label class="required">Propietario Nombre y Apellidos</label>
            <el-input
              type="text"
              :class="{
                'parsley-error': form.errors?.nombre_prop,
              }"
              v-model="form.nombre_prop"
              autosize
            ></el-input>
            <ul
              v-if="form.errors?.nombre_prop"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.nombre_prop[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mb-2">
            <label class="required">Propietario Cedula de Identidad</label>
            <el-input
              type="text"
              :class="{
                'parsley-error': form.errors?.ci_prop,
              }"
              v-model="form.ci_prop"
              autosize
            ></el-input>
            <ul
              v-if="form.errors?.ci_prop"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.ci_prop[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mb-2">
            <label
              >Correo electrónico <small>(Opcional recomendado)</small></label
            >
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
            <label class="required">Celular</label>
            <el-input
              type="text"
              :class="{
                'parsley-error': form.errors?.cel,
              }"
              v-model="form.cel"
              autosize
            ></el-input>
            <ul
              v-if="form.errors?.cel"
              class="d-block text-danger list-unstyled"
            >
              <li class="parsley-required">
                {{ form.errors?.cel[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mb-2">
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
          <div class="col-md-4 mb-2">
            <label class="required">Dirección</label>
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
            <label class="required">Dirección GPS</label>
            <div class="row">
              <div class="col-6">
                <input
                  type="text"
                  class="form-control"
                  :class="{
                    'parsley-error': form.errors?.latitud,
                  }"
                  v-model="form.latitud"
                />
                <small class="text-xs text-muted">Latitud</small>
                <ul
                  v-if="form.errors?.latitud"
                  class="list-unstyled text-danger"
                >
                  <li class="parsley-required">
                    {{ form.errors?.latitud[0] }}
                  </li>
                </ul>
              </div>
              <div class="col-6">
                <input
                  type="text"
                  class="form-control"
                  :class="{
                    'parsley-error': form.errors?.longitud,
                  }"
                  v-model="form.longitud"
                />
                <small class="text-xs text-muted">Longitud</small>
                <ul
                  v-if="form.errors?.longitud"
                  class="list-unstyled text-danger"
                >
                  <li class="parsley-required">
                    {{ form.errors?.longitud[0] }}
                  </li>
                </ul>
              </div>
            </div>
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
