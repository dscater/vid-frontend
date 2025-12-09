import { onMounted, ref } from "vue";

const oTransferencia = ref({
  id: 0,
  sucursal_id: "",
  sucursal_destino: "",
  user_sol: "",
  user_ap: "",
  cantidad_total: "",
  cantidad_total_v: "",
  fecha: "",
  hora: "",
  observaciones: "",
  estado: "",
  verificado: "",
  transferencia_detalles: [],
  eliminados_detalles: [],
  verificado: 0,
  _method: "POST",
});

export const useTransferencias = () => {
  const setTransferencia = (item = null) => {
    if (item) {
      oTransferencia.value.id = item.id;
      oTransferencia.value.sucursal_id = item.sucursal_id;
      oTransferencia.value.sucursal_destino = item.sucursal_destino;
      oTransferencia.value.user_sol = item.user_sol;
      oTransferencia.value.user_ap = item.user_ap;
      oTransferencia.value.cantidad_total = item.cantidad_total;
      oTransferencia.value.cantidad_total_v = item.cantidad_total_v;
      oTransferencia.value.fecha = item.fecha;
      oTransferencia.value.hora = item.hora;
      oTransferencia.value.observaciones = item.observaciones;
      oTransferencia.value.estado = item.estado;
      oTransferencia.value.verificado = item.verificado;
      oTransferencia.value.transferencia_detalles = item.transferencia_detalles;
      oTransferencia.value.eliminados_detalles = [];
      oTransferencia.value._method = "PUT";
      return oTransferencia;
    }
    return false;
  };

  const limpiarTransferencia = () => {
    oTransferencia.value.id = 0;
    oTransferencia.value.sucursal_id = "";
    oTransferencia.value.sucursal_destino = "";
    oTransferencia.value.user_sol = "";
    oTransferencia.value.user_ap = "";
    oTransferencia.value.cantidad_total = "";
    oTransferencia.value.cantidad_total_v = "";
    oTransferencia.value.fecha = "";
    oTransferencia.value.hora = "";
    oTransferencia.value.observaciones = "";
    oTransferencia.value.estado = "";
    oTransferencia.value.verificado = "";
    oTransferencia.value.transferencia_detalles = [];
    oTransferencia.value.eliminados_detalles = [];
    oTransferencia.value._method = "POST";
  };

  onMounted(() => {});

  return {
    oTransferencia,
    setTransferencia,
    limpiarTransferencia,
  };
};
