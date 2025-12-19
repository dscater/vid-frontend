import { onMounted, ref } from "vue";
import { useAuthStore } from "../../stores/authStore";

const oProforma = ref({
  id: 0,
  sucursal_ids: [],
  cliente_id: "",
  fecha: "",
  hora: "",
  cantidad_total: "",
  total: "",
  total_st: "",
  solicitud_descuento: "",
  descuento: 0,
  total_f: "",
  forma_pago: "",
  cancelado: "",
  cambio: "",
  cs_f: "",
  observaciones: "",
  proforma_productos: [],
  eliminados_productos: [],
  proforma_detalles: [],
  eliminados_detalles: [],
  _method: "POST",
});

export const useProformas = () => {
  const authStore = useAuthStore();
  const setProforma = (item = null, withUser = false) => {
    if (item) {
      oProforma.value.id = item.id;
      oProforma.value.nro = item.nro;
      oProforma.value.codigo = item.codigo;
      oProforma.value.sucursals_txt = item.sucursals_txt;
      oProforma.value.sucursal_ids = item.sucursal_ids;
      oProforma.value.cliente_id = item.cliente_id;
      oProforma.value.fecha = item.fecha;
      oProforma.value.fecha_c = item.fecha_c;
      oProforma.value.fecha_ct = item.fecha_ct;
      oProforma.value.fecha_t = item.fecha_t;
      oProforma.value.hora = item.hora;
      oProforma.value.cantidad_total = item.cantidad_total;
      oProforma.value.total = item.total;
      oProforma.value.total_st = item.total_st;
      oProforma.value.solicitud_descuento = item.solicitud_descuento;
      oProforma.value.descuento = item.descuento;
      oProforma.value.total_f = item.total_f;
      oProforma.value.forma_pago = item.forma_pago;
      oProforma.value.cancelado = item.cancelado;
      oProforma.value.cambio = item.cambio;
      oProforma.value.cs_f = item.cs_f;
      oProforma.value.observaciones = item.observaciones;
      oProforma.value.cliente = item.cliente;
      if (withUser) {
        oProforma.value.user = item.user;
      }
      oProforma.value.proforma_productos = item.proforma_productos;
      oProforma.value.eliminados_productos = [];
      oProforma.value.proforma_detalles = item.proforma_detalles;
      oProforma.value.eliminados_detalles = [];
      oProforma.value._method = "PUT";
      return oProforma;
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

  const limpiarProforma = () => {
    oProforma.value.id = 0;
    oProforma.value.sucursal_ids = [];
    oProforma.value.cliente_id = "";
    oProforma.value.fecha = getFechaAtual();
    oProforma.value.hora = getHoraActual();
    oProforma.value.cantidad_total = "";
    oProforma.value.total = "";
    oProforma.value.total_st = "";
    oProforma.value.solicitud_descuento = 0;
    oProforma.value.descuento = 0;
    oProforma.value.total_f = "";
    oProforma.value.forma_pago = "EFECTIVO";
    oProforma.value.cancelado = "";
    oProforma.value.cambio = "";
    oProforma.value.cs_f = "CON FACTURA";
    oProforma.value.observaciones = "";
    oProforma.value.proforma_productos = [];
    oProforma.value.eliminados_productos = [];
    oProforma.value.proforma_detalles = [];
    oProforma.value.eliminados_detalles = [];
    oProforma.value._method = "POST";
  };

  onMounted(() => {});

  return {
    oProforma,
    setProforma,
    limpiarProforma,
  };
};
