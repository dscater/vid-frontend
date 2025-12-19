<script setup>
  import MiModal from "../../../Components/MiModal.vue";
  import { watch, ref, computed, onMounted, nextTick, reactive } from "vue";
  import api from "../../../composables/axios.js";
  const props = defineProps({
    muestra_formulario: {
      type: Boolean,
      default: false,
    },
    url: {
      type: String,
      default: 0,
    },
  });

  const link = ref(props.url);
  const muestra_form = ref(props.muestra_formulario);
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
    () => props.url,
    (newValue) => {
      link.value = newValue;
    }
  );

  const tituloDialog = computed(() => {
    return `<i class="fa fa-eye"></i> Imagen Producto`;
  });

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
      <div class="row">
        <div class="col-12 text-center">
          <img :src="link" alt="" style="max-width: 100%" />
        </div>
      </div>
    </template>
    <template #footer>
      <button
        type="button"
        class="btn btn-default"
        @click.prevent="cerrarFormulario()"
      >
        Cerrar
      </button>
    </template>
  </MiModal>
</template>
