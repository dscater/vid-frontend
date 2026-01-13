import { onMounted, ref } from "vue";

const oOrdenSalida = ref({
  id: 0,
  sucursal_id: "",
  user_sol: "",
  user_ap: "",
  fecha: "",
  hora: "",
  observaciones: "",
  cantidad_total: "",
  total: "",
  estado: "",
  verificado: "",
  user_id: "",
  orden_salida_detalles: [],
  eliminados_detalles: [],
  verificado: 0,
  _method: "POST",
});

export const useOrdenSalidas = () => {
  const setOrdenSalida = (item = null) => {
    if (item) {
      oOrdenSalida.value.id = item.id;
      oOrdenSalida.value.sucursal_id = item.sucursal_id;
      oOrdenSalida.value.sucursal = item.sucursal;
      oOrdenSalida.value.user_sol = item.user_sol;
      oOrdenSalida.value.user_ap = item.user_ap;
      oOrdenSalida.value.user_solicitante = item.user_solicitante;
      oOrdenSalida.value.user_aprobador = item.user_aprobador;
      oOrdenSalida.value.fecha = item.fecha;
      oOrdenSalida.value.hora = item.hora;
      oOrdenSalida.value.observaciones = item.observaciones;
      oOrdenSalida.value.cantidad_total = item.cantidad_total;
      oOrdenSalida.value.total = item.total;
      oOrdenSalida.value.estado = item.estado;
      oOrdenSalida.value.verificado = item.verificado;
      oOrdenSalida.value.user_id = item.user_id;
      oOrdenSalida.value.orden_salida_detalles = item.orden_salida_detalles;
      oOrdenSalida.value.eliminados_detalles = [];
      oOrdenSalida.value._method = "PUT";
      return oOrdenSalida;
    }
    return false;
  };

  const limpiarOrdenSalida = () => {
    oOrdenSalida.value.id = 0;
    oOrdenSalida.value.sucursal_id = "";
    oOrdenSalida.value.user_sol = "";
    oOrdenSalida.value.user_ap = "";
    oOrdenSalida.value.fecha = "";
    oOrdenSalida.value.hora = "";
    oOrdenSalida.value.observaciones = "";
    oOrdenSalida.value.cantidad_total = "";
    oOrdenSalida.value.total = "CON FATURA";
    oOrdenSalida.value.estado = "";
    oOrdenSalida.value.verificado = "";
    oOrdenSalida.value.user_id = "";
    oOrdenSalida.value.orden_salida_detalles = [];
    oOrdenSalida.value.eliminados_detalles = [];
    oOrdenSalida.value._method = "POST";
  };

  onMounted(() => {});

  return {
    oOrdenSalida,
    setOrdenSalida,
    limpiarOrdenSalida,
  };
};
