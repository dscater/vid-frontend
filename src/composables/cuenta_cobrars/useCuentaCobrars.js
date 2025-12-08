import { onMounted, ref } from "vue";

const oCuentaCobrar = ref({
  id: 0,
  cliente_id: "",
  orden_venta_id: "",
  total: "",
  cancelado: "",
  saldo: "",
  fecha: "",
  hora: "",
  orden_venta: null,
  cliente: null,
  cuenta_cobrar_detalles: [],
  _method: "POST",
});

export const useCuentaCobrars = () => {
  const setCuentaCobrar = (item = null, ver = false) => {
    if (item) {
      oCuentaCobrar.value.id = item.id;
      oCuentaCobrar.value.cliente_id = item.cliente_id;
      oCuentaCobrar.value.orden_venta_id = item.orden_venta_id;
      oCuentaCobrar.value.total = item.total;
      oCuentaCobrar.value.cancelado = item.cancelado;
      oCuentaCobrar.value.saldo = item.saldo;
      oCuentaCobrar.value.fecha = item.fecha;
      oCuentaCobrar.value.hora = item.hora;
      oCuentaCobrar.value.orden_venta = item.orden_venta;
      oCuentaCobrar.value.cliente = item.cliente;
      oCuentaCobrar.value.cuenta_cobrar_detalles = item.cuenta_cobrar_detalles;
      oCuentaCobrar.value._method = "PUT";
      return oCuentaCobrar;
    }
    return false;
  };

  const limpiarCuentaCobrar = () => {
    oCuentaCobrar.value.id = 0;
    oCuentaCobrar.value.cliente_id = "";
    oCuentaCobrar.value.orden_venta_id = "";
    oCuentaCobrar.value.total = "";
    oCuentaCobrar.value.cancelado = 0;
    oCuentaCobrar.value.saldo = "";
    oCuentaCobrar.value.fecha = "";
    oCuentaCobrar.value.hora = "";
    oCuentaCobrar.value.orden_venta = null;
    oCuentaCobrar.value.cliente = null;
    oCuentaCobrar.value.cuenta_cobrar_detalles = [];
    oCuentaCobrar.value._method = "POST";
  };

  onMounted(() => {});

  return {
    oCuentaCobrar,
    setCuentaCobrar,
    limpiarCuentaCobrar,
  };
};
