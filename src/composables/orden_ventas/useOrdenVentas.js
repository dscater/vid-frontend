import { onMounted, ref } from "vue";
import { useAuthStore } from "../../stores/authStore";
const oOrdenVenta = ref({
  id: 0,
  sucursal_id: "",
  cliente_id: "",
  fecha: "",
  hora: "",
  cantidad_total: "",
  total: "",
  total_st: "",
  solicitud_descuento: 0,
  solicitud_sw: 0,
  user_ap: "",
  monto_solicitud: 0,
  descuento: 0,
  total_f: "",
  con: "",
  cancelado_c: "",
  qr: "",
  cancelado_qr: "",
  cre: "",
  credito: "",
  cancelado: "",
  forma_pago: "",
  cambio: "",
  cs_f: "",
  observaciones: "",
  estado: "",
  verificado: 0,
  orden_venta_detalles: [],
  eliminados_detalles: [],
  verificado: 0,
  _method: "POST",
});

export const useOrdenVentas = () => {
  const authStore = useAuthStore();
  const setOrdenVenta = (item = null, withUser = false) => {
    if (item) {
      oOrdenVenta.value.id = item.id;
      oOrdenVenta.value.nro = item.nro;
      oOrdenVenta.value.codigo = item.codigo;
      oOrdenVenta.value.sucursal_id = item.sucursal_id;
      oOrdenVenta.value.cliente_id = item.cliente_id;
      oOrdenVenta.value.fecha = item.fecha;
      oOrdenVenta.value.hora = item.hora;
      oOrdenVenta.value.fecha_ct = item.fecha_ct;
      oOrdenVenta.value.fecha_t = item.fecha_t;
      oOrdenVenta.value.cantidad_total = item.cantidad_total;
      oOrdenVenta.value.total = item.total;
      oOrdenVenta.value.total_st = item.total_st;
      oOrdenVenta.value.solicitud_descuento = item.solicitud_descuento;
      oOrdenVenta.value.solicitud_sw = item.solicitud_sw;
      oOrdenVenta.value.user_ap = item.user_ap;
      oOrdenVenta.value.monto_solicitud = item.monto_solicitud;
      oOrdenVenta.value.descuento = item.descuento;
      oOrdenVenta.value.total_f = item.total_f;
      oOrdenVenta.value.con = item.con;
      oOrdenVenta.value.cancelado_c = item.cancelado_c;
      oOrdenVenta.value.qr = item.qr;
      oOrdenVenta.value.cancelado_qr = item.cancelado_qr;
      oOrdenVenta.value.cre = item.cre;
      oOrdenVenta.value.credito = item.credito;
      oOrdenVenta.value.cancelado = item.cancelado;
      oOrdenVenta.value.forma_pago = item.forma_pago;
      oOrdenVenta.value.cambio = item.cambio;
      oOrdenVenta.value.cs_f = item.cs_f;
      oOrdenVenta.value.observaciones = item.observaciones;
      oOrdenVenta.value.estado = item.estado;
      oOrdenVenta.value.verificado = item.verificado;
      oOrdenVenta.value.cliente = item.cliente;
      if (withUser) {
        oOrdenVenta.value.user = item.user;
      }
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
    oOrdenVenta.value.sucursal_id = authStore?.user.sucursal_asignada
      ? authStore?.user.sucursal_asignada.id
      : "";
    oOrdenVenta.value.cliente_id = "";
    oOrdenVenta.value.fecha = getFechaAtual();
    oOrdenVenta.value.hora = getHoraActual();
    oOrdenVenta.value.cantidad_total = "";
    oOrdenVenta.value.total = "";
    oOrdenVenta.value.total_st = "";
    oOrdenVenta.value.solicitud_descuento = 0;
    oOrdenVenta.value.solicitud_sw = 0;
    oOrdenVenta.value.user_ap = "";
    oOrdenVenta.value.monto_solicitud = 0;
    oOrdenVenta.value.descuento = 0;
    oOrdenVenta.value.total_f = "";
    oOrdenVenta.value.con = 1;
    oOrdenVenta.value.cancelado_c = 0;
    oOrdenVenta.value.qr = 0;
    oOrdenVenta.value.cancelado_qr = 0;
    oOrdenVenta.value.cre = 0;
    oOrdenVenta.value.credito = 0;

    oOrdenVenta.value.cancelado = "";
    oOrdenVenta.value.forma_pago = "EFECTIVO";
    oOrdenVenta.value.cambio = "";
    oOrdenVenta.value.cs_f = "CON FACTURA";
    oOrdenVenta.value.observaciones = "";
    oOrdenVenta.value.estado = "";
    oOrdenVenta.value.verificado = "";
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
