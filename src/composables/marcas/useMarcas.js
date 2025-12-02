import { onMounted, ref } from "vue";

const oMarca = ref({
  id: 0,
  nombre: "",
  _method: "POST",
});

export const useMarcas = () => {
  const setMarca = (item = null, ver = false) => {
    if (item) {
      oMarca.value.id = item.id;
      oMarca.value.nombre = item.nombre;
      oMarca.value._method = "PUT";
      return oMarca;
    }
    return false;
  };

  const limpiarMarca = () => {
    oMarca.value.id = 0;
    oMarca.value.nombre = "";
    oMarca.value._method = "POST";
  };

  onMounted(() => {});

  return {
    oMarca,
    setMarca,
    limpiarMarca,
  };
};
