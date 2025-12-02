import { onMounted, ref } from "vue";

const oSubCategoria = ref({
  id: 0,
  nombre: "",
  categoria_id: "",
  _method: "POST",
});

export const useSubCategorias = () => {
  const setSubCategoria = (item = null, ver = false) => {
    if (item) {
      oSubCategoria.value.id = item.id;
      oSubCategoria.value.nombre = item.nombre;
      oSubCategoria.value.categoria_id = item.categoria_id;
      oSubCategoria.value._method = "PUT";
      return oSubCategoria;
    }
    return false;
  };

  const limpiarSubCategoria = () => {
    oSubCategoria.value.id = 0;
    oSubCategoria.value.nombre = "";
    oSubCategoria.value.categoria_id = "";
    oSubCategoria.value._method = "POST";
  };

  onMounted(() => {});

  return {
    oSubCategoria,
    setSubCategoria,
    limpiarSubCategoria,
  };
};
