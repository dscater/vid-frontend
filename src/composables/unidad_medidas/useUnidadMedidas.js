import { onMounted, ref } from "vue";

const oUnidadMedida = ref({
  id: 0,
  nombre: "",
  _method: "POST",
});

export const useUnidadMedidas = () => {
  const setUnidadMedida = (item = null, ver = false) => {
    if (item) {
      oUnidadMedida.value.id = item.id;
      oUnidadMedida.value.nombre = item.nombre;
      oUnidadMedida.value._method = "PUT";
      return oUnidadMedida;
    }
    return false;
  };

  const limpiarUnidadMedida = () => {
    oUnidadMedida.value.id = 0;
    oUnidadMedida.value.nombre = "";
    oUnidadMedida.value._method = "POST";
  };

  onMounted(() => {});

  return {
    oUnidadMedida,
    setUnidadMedida,
    limpiarUnidadMedida,
  };
};
