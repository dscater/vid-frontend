<script setup>
  import MiModal from "../../../components/MiModal.vue";
  import { useUsuarios } from "../../../composables/usuarios/useUsuarios";
  import {
    watch,
    ref,
    computed,
    defineEmits,
    onMounted,
    nextTick,
    reactive,
    toRaw,
  } from "vue";

  import MiDropZone from "../../../components/MiDropZone.vue";
  import api, { setAuthToken } from "../../../composables/axios";
  import { useAuthStore } from "../../../stores/authStore";
  import { isArray } from "highcharts";
  const apiUrl = import.meta.env.VITE_API_URL;
  const urlServer = import.meta.env.VITE_URL_SERVER + "/";
  const authStore = useAuthStore();

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

  const { oUsuario, limpiarUsuario } = useUsuarios();
  const accion_form = ref(props.accion_formulario);
  const muestra_form = ref(props.muestra_formulario);
  const enviando = ref(false);
  let form = reactive(oUsuario.value);
  watch(
    () => props.muestra_formulario,
    (newValue) => {
      muestra_form.value = newValue;
      if (muestra_form.value) {
        cargarRoles();
        document.getElementsByTagName("body")[0].classList.add("modal-open");
        form = oUsuario.value;
        form.errors = null;
        options.value = [
          {
            value: oUsuario.value.persona_id,
            label: oUsuario.value.persona
              ? `${oUsuario.value.persona.full_name} - ${oUsuario.value.persona.ci}`
              : "Cargando...",
          },
        ];
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

  const listExpedido = [
    { value: "LP", label: "La Paz" },
    { value: "CB", label: "Cochabamba" },
    { value: "SC", label: "Santa Cruz" },
    { value: "CH", label: "Chuquisaca" },
    { value: "OR", label: "Oruro" },
    { value: "PT", label: "Potosi" },
    { value: "TJ", label: "Tarija" },
    { value: "PD", label: "Pando" },
    { value: "BN", label: "Beni" },
    { value: "QR", label: "QR" },
  ];

  const listRoles = ref([]);
  const foto = ref(null);

  function cargaArchivo(e, key) {
    form[key] = null;
    form[key] = e.target.files[0];
  }

  const tituloDialog = computed(() => {
    return accion_form.value == 0
      ? `<i class="fa fa-plus"></i> Nuevo Usuario`
      : `<i class="fa fa-edit"></i> Editar Usuario`;
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
        ? "/admin/usuarios"
        : "/admin/usuarios/update/" + form.id;

    const formData = buildFormDataUsuario(form);
    api
      .post(url, formData)
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
        limpiarUsuario();
        emits("envio-formulario");
      })
      .catch((error) => {
        if (
          error.response &&
          error.response.data &&
          error.response.data.errors
        ) {
          let msgError =
            "Existen errores en el formulario, por favor verifique";

          if (
            error.response.data.errors.error &&
            error.response.data.errors.error[0]
          ) {
            msgError = "Ocurrió un error al registrar intente mas tarde";
          }

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
  const buildFormDataUsuario = (form) => {
    const fd = new FormData();

    Object.entries(toRaw(form)).forEach(([key, value]) => {
      // Si es array (ej: certificados)
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          // Recorremos cada propiedad del objeto
          Object.entries(item).forEach(([childKey, childValue]) => {
            // Si es un archivo nuevo
            if (childValue instanceof File) {
              fd.append(`${key}[${index}][${childKey}]`, childValue);
            }

            // Cualquier otro valor normal
            else {
              fd.append(`${key}[${index}][${childKey}]`, childValue ?? "");
            }
          });
        });
      }

      // Si es File directo
      else if (value instanceof File) {
        fd.append(key, value);
      }

      // Cualquier valor normal
      else {
        fd.append(key, value ?? "");
      }
    });

    return fd;
  };

  const cargarRoles = async () => {
    api
      .get("/admin/roles/listado")
      .then((response) => {
        listRoles.value = response.data.roles;
      })
      .catch((error) => {
        console.log(error);
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

  const detectaCertificados = (files) => {
    form.certificados = files;
  };

  const detectaEliminadosCertificados = (eliminados) => {
    form.certificados_eliminados = eliminados;
  };

  const detectaDocumentos = (files) => {
    form.documentos = files;
  };

  const detectaEliminadosDocumentos = (eliminados) => {
    form.documentos_eliminados = eliminados;
  };

  const cargarListas = () => {};

  const options = ref([]);
  const loading = ref(false);
  onMounted(() => {
    cargarListas();
  });
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
        <div class="row mb-2">
          <div class="col-12">
            <h4>Datos Personales</h4>
          </div>
          <div class="col-md-4 mt-2">
            <label class="required">Nombre(s)</label>
            <input
              type="text"
              class="form-control"
              :class="{
                'parsley-error': form.errors?.nombre,
              }"
              v-model="form.nombre"
            />
            <ul v-if="form.errors?.nombre" class="list-unstyled text-danger">
              <li class="parsley-required">
                {{ form.errors?.nombre[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mt-2">
            <label class="required">Ap. Paterno</label>
            <input
              type="text"
              class="form-control"
              :class="{
                'parsley-error': form.errors?.paterno,
              }"
              v-model="form.paterno"
            />

            <ul v-if="form.errors?.paterno" class="list-unstyled text-danger">
              <li class="parsley-required">
                {{ form.errors?.paterno[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mt-2">
            <label>Ap. Materno</label>
            <input
              type="text"
              class="form-control"
              :class="{
                'parsley-error': form.errors?.materno,
              }"
              v-model="form.materno"
            />

            <ul v-if="form.errors?.materno" class="list-unstyled text-danger">
              <li class="parsley-required">
                {{ form.errors?.materno[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mt-2">
            <label class="required">Número de C.I.</label>
            <input
              type="number"
              class="form-control"
              :class="{
                'parsley-error': form.errors?.ci,
              }"
              v-model="form.ci"
            />

            <ul v-if="form.errors?.ci" class="list-unstyled text-danger">
              <li class="parsley-required">
                {{ form.errors?.ci[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mt-2">
            <label class="required">Expedido</label>
            <select
              class="form-control"
              :class="{
                'parsley-error': form.errors?.ci_exp,
              }"
              v-model="form.ci_exp"
            >
              <option value="">- Seleccione -</option>
              <option v-for="item in listExpedido" :value="item.value">
                {{ item.label }}
              </option>
            </select>
            <ul v-if="form.errors?.ci_exp" class="list-unstyled text-danger">
              <li class="parsley-required">
                {{ form.errors?.ci_exp[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mt-2">
            <label class="required">Grupo Sanguíneo</label>
            <input
              type="text"
              class="form-control"
              :class="{
                'parsley-error': form.errors?.grupo_san,
              }"
              v-model="form.grupo_san"
            />

            <ul v-if="form.errors?.grupo_san" class="list-unstyled text-danger">
              <li class="parsley-required">
                {{ form.errors?.grupo_san[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mt-2">
            <label class="required">Sexo</label>
            <input
              type="text"
              class="form-control"
              :class="{
                'parsley-error': form.errors?.sexo,
              }"
              v-model="form.sexo"
            />

            <ul v-if="form.errors?.sexo" class="list-unstyled text-danger">
              <li class="parsley-required">
                {{ form.errors?.sexo[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mt-2">
            <label class="required">Nacionalidad</label>
            <input
              type="text"
              class="form-control"
              :class="{
                'parsley-error': form.errors?.nacionalidad,
              }"
              v-model="form.nacionalidad"
            />

            <ul
              v-if="form.errors?.nacionalidad"
              class="list-unstyled text-danger"
            >
              <li class="parsley-required">
                {{ form.errors?.nacionalidad[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mt-2">
            <label>Profesión</label>
            <input
              type="text"
              class="form-control"
              :class="{
                'parsley-error': form.errors?.profesion,
              }"
              v-model="form.profesion"
            />

            <ul v-if="form.errors?.profesion" class="list-unstyled text-danger">
              <li class="parsley-required">
                {{ form.errors?.profesion[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mt-2">
            <label class="required">Celular</label>
            <input
              type="text"
              class="form-control"
              :class="{
                'parsley-error': form.errors?.cel,
              }"
              v-model="form.cel"
            />

            <ul v-if="form.errors?.cel" class="list-unstyled text-danger">
              <li class="parsley-required">
                {{ form.errors?.cel[0] }}
              </li>
            </ul>
          </div>
        </div>
        <div class="row mb-2">
          <div class="col-12">
            <h4>Datos de Contacto</h4>
          </div>
          <div class="col-md-4 mt-2">
            <label>Teléfono de domicilio</label>
            <input
              type="text"
              class="form-control"
              :class="{
                'parsley-error': form.errors?.fono,
              }"
              v-model="form.fono"
            />

            <ul v-if="form.errors?.fono" class="list-unstyled text-danger">
              <li class="parsley-required">
                {{ form.errors?.fono[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mt-2">
            <label class="required">Celular de Domiclio</label>
            <input
              type="text"
              class="form-control"
              :class="{
                'parsley-error': form.errors?.cel_dom,
              }"
              v-model="form.cel_dom"
            />

            <ul v-if="form.errors?.cel_dom" class="list-unstyled text-danger">
              <li class="parsley-required">
                {{ form.errors?.cel_dom[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-4 mt-2">
            <label class="required">Dirección de domicilio</label>
            <input
              type="text"
              class="form-control"
              :class="{
                'parsley-error': form.errors?.dir,
              }"
              v-model="form.dir"
            />

            <ul v-if="form.errors?.dir" class="list-unstyled text-danger">
              <li class="parsley-required">
                {{ form.errors?.dir[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-6 mt-2">
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
          <div class="col-md-6 mt-2">
            <label class="required">Correo electrónico</label>
            <input
              type="email"
              class="form-control"
              :class="{
                'parsley-error': form.errors?.correo,
              }"
              v-model="form.correo"
            />

            <ul v-if="form.errors?.correo" class="list-unstyled text-danger">
              <li class="parsley-required">
                {{ form.errors?.correo[0] }}
              </li>
            </ul>
          </div>
        </div>
        <div class="row mb-3">
          <div class="col-12">
            <h4>Documentos Digitalizados</h4>
          </div>
          <div class="col-md-6 mb-2">
            <label>Foto</label>
            <input
              type="file"
              class="form-control"
              :class="{
                'parsley-error': form.errors?.foto,
              }"
              ref="foto"
              @change="cargaArchivo($event, 'foto')"
            />

            <ul v-if="form.errors?.foto" class="list-unstyled text-danger">
              <li class="parsley-required">
                {{ form.errors?.foto[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-6 mb-2">
            <label>Carnet</label>
            <input
              type="file"
              class="form-control"
              :class="{
                'parsley-error': form.errors?.carnet,
              }"
              ref="carnet"
              @change="cargaArchivo($event, 'carnet')"
            />

            <ul v-if="form.errors?.carnet" class="list-unstyled text-danger">
              <li class="parsley-required">
                {{ form.errors?.carnet[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-6 mb-2">
            <label class=""
              >Certificados <small class="text-muted">(Opcional)</small></label
            >
            <MiDropZone
              :url_assets="urlServer"
              :files="form.certificados"
              @UpdateFiles="detectaCertificados"
              @addEliminados="detectaEliminadosCertificados"
            ></MiDropZone>
            <ul
              v-if="form.errors?.certificados"
              class="parsley-errors-list filled"
            >
              <li class="parsley-required">
                {{ form.errors?.certificados[0] }}
              </li>
            </ul>
          </div>
          <div class="col-md-6 mb-2">
            <label class=""
              >Documentos Adicionales
              <small class="text-muted">(Opcional)</small></label
            >
            <MiDropZone
              :url_assets="urlServer"
              :files="form.documentos"
              @UpdateFiles="detectaDocumentos"
              @addEliminados="detectaEliminadosDocumentos"
            ></MiDropZone>
            <ul
              v-if="form.errors?.documentos"
              class="parsley-errors-list filled"
            >
              <li class="parsley-required">
                {{ form.errors?.documentos[0] }}
              </li>
            </ul>
          </div>
        </div>
        <div class="row">
          <div class="col-md-4 mt-2">
            <label class="required">Seleccionar Tipo de Empleado</label>
            <select
              class="form-control"
              :class="{
                'parsley-error': form.errors?.tipo,
              }"
              v-model="form.tipo"
            >
              <option value="">- Seleccione -</option>
              <option value="EMPLEADO">EMPLEADO</option>
              <option value="USUARIO">USUARIO</option>
            </select>

            <ul v-if="form.errors?.tipo" class="list-unstyled text-danger">
              <li class="parsley-required">
                {{ form.errors?.tipo[0] }}
              </li>
            </ul>
          </div>
          <template v-if="form.tipo == 'USUARIO'">
            <div class="col-md-4 mt-2">
              <label class="required">Seleccionar Role</label>
              <select
                class="form-control"
                :class="{
                  'parsley-error': form.errors?.role_id,
                }"
                v-model="form.role_id"
              >
                <option value="">- Seleccione -</option>
                <option v-for="item in listRoles" :value="item.id">
                  {{ item.nombre }}
                </option>
              </select>

              <ul v-if="form.errors?.role_id" class="list-unstyled text-danger">
                <li class="parsley-required">
                  {{ form.errors?.role_id[0] }}
                </li>
              </ul>
            </div>
            <div class="col-md-4 mt-2">
              <label class="required">Acceso</label><br />
              <el-switch
                size="large"
                v-model="form.acceso"
                class="mb-2"
                style="
                  --el-switch-on-color: #13ce66;
                  --el-switch-off-color: #ff4949;
                "
                active-text="Habilitado"
                inactive-text="Deshabilitado"
                active-value="1"
                inactive-value="0"
              />
              <ul v-if="form.errors?.acceso" class="list-unstyled text-danger">
                <li class="parsley-required">
                  {{ form.errors?.acceso[0] }}
                </li>
              </ul>
            </div>
          </template>
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
