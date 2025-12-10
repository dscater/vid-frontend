import { onMounted, ref } from "vue";

const oGasto = ref({
  id: 0,
  descripcion: "",
  monto: "",
  fecha: "",
  hora: "",
  _method: "POST",
});

export const useGastos = () => {
  const setGasto = (item = null, ver = false) => {
    if (item) {
      oGasto.value.id = item.id;
      oGasto.value.descripcion = item.descripcion;
      oGasto.value.monto = item.monto;
      oGasto.value.fecha = item.fecha;
      oGasto.value.hora = item.hora;
      oGasto.value._method = "PUT";
      return oGasto;
    }
    return false;
  };

  const limpiarGasto = () => {
    oGasto.value.id = 0;
    oGasto.value.descripcion = "";
    oGasto.value.monto = 0;
    oGasto.value.fecha = getFechaAtual();
    oGasto.value.hora = getHoraActual();
    oGasto.value._method = "POST";
  };

  const getFechaAtual = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getHoraActual = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  onMounted(() => {});

  return {
    oGasto,
    setGasto,
    limpiarGasto,
  };
};
