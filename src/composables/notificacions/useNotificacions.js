import { onMounted, ref } from "vue";

const oNotificacion = ref({
  id: 0,
  descripcion: "",
  modulo: "",
  modulo_id: "",
  fecha: "",
  hora: "",
  _method: "POST",
});

export const useNotificacions = () => {
  const setNotificacion = (item = null, ver = false) => {
    if (item) {
      oNotificacion.value.id = item.id;
      oNotificacion.value.descripcion = item.descripcion;
      oNotificacion.value.modulo = item.modulo;
      oNotificacion.value.modulo_id = item.modulo_id;
      oNotificacion.value.fecha = item.fecha;
      oNotificacion.value.fecha_c = item.fecha_c;
      oNotificacion.value.hora = item.hora;
      oNotificacion.value._method = "PUT";
      return oNotificacion;
    }
    return false;
  };

  const limpiarNotificacion = () => {
    oNotificacion.value.id = 0;
    oNotificacion.value.descripcion = "";
    oNotificacion.value.modulo = "";
    oNotificacion.value.modulo_id = "";
    oNotificacion.value.fecha = "";
    oNotificacion.value.hora = "";
    oNotificacion.value._method = "POST";
  };

  onMounted(() => {});

  return {
    oNotificacion,
    setNotificacion,
    limpiarNotificacion,
  };
};
