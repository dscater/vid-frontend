import { onMounted, ref } from "vue";

const oOrdenVenta = ref({
  id: 0,
  sucursal_id: "",
  cliente_id: "",
  fecha: "",
  hora: "",
  cantidad_total: "",
  total: "",
  solicitud_descuento: "",
  solicitud_sw: "",
  monto_solicitud: "",
  descuento: "",
  total_f: "",
  forma_pago: "",
  cancelado: "",
  cambio: "",
  cs_f: "",
  observaciones: "",
  orden_venta_detalles: [],
  eliminados_detalles: [],
  verificado: 0,
  _method: "POST",
});

export const useOrdenVentas = () => {
  const setOrdenVenta = (item = null) => {
    if (item) {
      oOrdenVenta.value.id = item.id;
      oOrdenVenta.value.sucursal_id = item.sucursal_id;
      oOrdenVenta.value.cliente_id = item.cliente_id;
      oOrdenVenta.value.fecha = item.fecha;
      oOrdenVenta.value.hora = item.hora;
      oOrdenVenta.value.cantidad_total = item.cantidad_total;
      oOrdenVenta.value.total = item.total;
      oOrdenVenta.value.total_f = item.total_f;
      oOrdenVenta.value.forma_pago = item.forma_pago;
      oOrdenVenta.value.cancelado = item.cancelado;
      oOrdenVenta.value.cambio = item.cambio;
      oOrdenVenta.value.cs_f = item.cs_f;
      oOrdenVenta.value.observaciones = item.observaciones;
      oOrdenVenta.value.orden_venta_detalles = item.orden_venta_detalles;
      oOrdenVenta.value.eliminados_detalles = [];
      oOrdenVenta.value._method = "PUT";
      return oOrdenVenta;
    }
    return false;
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

  const limpiarOrdenVenta = () => {
    oOrdenVenta.value.id = 0;
    oOrdenVenta.value.sucursal_id = "";
    oOrdenVenta.value.cliente_id = "";
    oOrdenVenta.value.fecha = getFechaAtual();
    oOrdenVenta.value.hora = getHoraActual();
    oOrdenVenta.value.cantidad_total = "";
    oOrdenVenta.value.total = "";
    oOrdenVenta.value.total_f = "";
    oOrdenVenta.value.forma_pago = "EFECTIVO";
    oOrdenVenta.value.cancelado = "";
    oOrdenVenta.value.cambio = "";
    oOrdenVenta.value.cs_f = "CON FACTURA";
    oOrdenVenta.value.observaciones = "";
    oOrdenVenta.value.orden_venta_detalles = [];
    oOrdenVenta.value.eliminados_detalles = [];
    oOrdenVenta.value._method = "POST";
  };

  onMounted(() => {});

  return {
    oOrdenVenta,
    setOrdenVenta,
    limpiarOrdenVenta,
  };
};
