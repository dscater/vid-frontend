<script setup>
  import MiModal from "../../../Components/MiModal.vue";
  import { watch, ref, computed, onMounted, nextTick, reactive } from "vue";
  import api from "../../../composables/axios.js";
  // TOAST
  import { toast } from "vue3-toastify";
  import "vue3-toastify/dist/index.css";
  const props = defineProps({
    proforma_detalle_producto: {
      type: Object,
      default: null,
    },
    muestra_formulario: {
      type: Boolean,
      default: false,
    },
    accion_formulario: {
      type: Number,
      default: 0,
    },
  });

  const oProformaDetalleProducto = ref(props.proforma_detalle_producto);
  const accion_form = ref(props.accion_formulario);
  const muestra_form = ref(props.muestra_formulario);
  const enviando = ref(false);
  watch(
    () => props.muestra_formulario,
    (newValue) => {
      muestra_form.value = newValue;
      if (muestra_form.value) {
        document.getElementsByTagName("body")[0].classList.add("modal-open");
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

  watch(
    () => props.proforma_detalle_producto,
    (newValue) => {
      oProformaDetalleProducto.value = newValue;
      if (oProformaDetalleProducto.value) {
        oProformaDetalleProducto.value.cantidad_entregada =
          oProformaDetalleProducto.value.cantidad_entregada ?? 0;
      }
    }
  );

  const tituloDialog = computed(() => {
    return accion_form.value == 0
      ? `<i class="fa fa-plus"></i> Nuevo Gasto`
      : `<i class="fa fa-check"></i> Verificar Entrega`;
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

    if (oProformaDetalleProducto.value.id) {
      if (oProformaDetalleProducto.value.verificado == 1) {
        api
          .post(
            "/admin/proforma_detalle_productos/verificar/" +
              oProformaDetalleProducto.value.id,
            {
              _method: "put",
              verificado: 1,
              cantidad_entregada:
                oProformaDetalleProducto.value.cantidad_entregada,
            }
          )
          .then((response) => {
            emits(
              "envio-formulario",
              oProformaDetalleProducto.value.verificado
            );
            enviando.value = false;
          });
      } else {
        api
          .post(
            "/admin/proforma_detalle_productos/verificar/" +
              oProformaDetalleProducto.value.id,
            {
              _method: "put",
              verificado: 0,
              cantidad_entregada:
                oProformaDetalleProducto.value.cantidad_entregada,
            }
          )
          .then((response) => {
            emits(
              "envio-formulario",
              oProformaDetalleProducto.value.verificado
            );
            enviando.value = false;
          });
      }
    } else {
      emits("envio-formulario", oProformaDetalleProducto.value.verificado);
      enviando.value = false;
    }
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

  const error = ref(false);
  const verificaCantidad = () => {
    error.value = false;
    if (oProformaDetalleProducto.value.cantidad_entregada) {
      if (
        oProformaDetalleProducto.value.cantidad_entregada >
        oProformaDetalleProducto.value.cantidad
      ) {
        toast.error("No puedes ingresar un valor mayor a la cantidad");
        oProformaDetalleProducto.value.cantidad_entregada =
          oProformaDetalleProducto.value.cantidad;
        error.value = true;
      } else if (oProformaDetalleProducto.value.cantidad_entregada < 1) {
        toast.error("No puedes ingresar un valor menor o igual a 0");
        error.value = true;
      }
    }
    oProformaDetalleProducto.value.verificado = 0;
    if (
      oProformaDetalleProducto.value.cantidad_entregada ==
      oProformaDetalleProducto.value.cantidad
    ) {
      oProformaDetalleProducto.value.verificado = 1;
    }
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
        <div class="row" v-if="oProformaDetalleProducto">
          <div class="col-12">
            <p class="text-md">
              <strong> Cantidad a entregar: </strong
              >{{ oProformaDetalleProducto.cantidad }}
              <i
                class="fa"
                :class="{
                  'fa-info-circle text-yellow':
                    oProformaDetalleProducto.cantidad !=
                    oProformaDetalleProducto.cantidad_entregada,
                  'fa-check-circle text-success':
                    oProformaDetalleProducto.cantidad ==
                    oProformaDetalleProducto.cantidad_entregada,
                }"
              ></i>
            </p>
          </div>
          <div class="col-12">
            <small class="font-weight-bold">Cantidad Entregada</small>
            <input
              type="number"
              class="form-control"
              min="1"
              v-model="oProformaDetalleProducto.cantidad_entregada"
              @keyup="verificaCantidad"
              @change="verificaCantidad"
            />
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
        v-if="!error"
        type="button"
        class="btn btn-success"
        :disabled="enviando"
        @click.prevent="enviarFormulario"
        v-html="textBtn"
      ></button>
    </template>
  </MiModal>
</template>
