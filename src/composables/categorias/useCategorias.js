import { onMounted, ref } from "vue";

const oCategoria = ref({
  id: 0,
  nombre: "",
  _method: "POST",
});

export const useCategorias = () => {
  const setCategoria = (item = null, ver = false) => {
    if (item) {
      oCategoria.value.id = item.id;
      oCategoria.value.nombre = item.nombre;
      oCategoria.value._method = "PUT";
      return oCategoria;
    }
    return false;
  };

  const limpiarCategoria = () => {
    oCategoria.value.id = 0;
    oCategoria.value.nombre = "";
    oCategoria.value._method = "POST";
  };

  onMounted(() => {});

  return {
    oCategoria,
    setCategoria,
    limpiarCategoria,
  };
};
