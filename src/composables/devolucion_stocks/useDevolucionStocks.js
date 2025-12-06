import { onMounted, ref } from "vue";

const oDevolucionStock = ref({
  id: 0,
  sucursal_id: "",
  fecha: "",
  hora: "",
  observaciones: "",
  cantidad_total: "",
  total: "",
  estado: "",
  verificado: "",
  user_id: "",
  devolucion_stock_detalles: [],
  eliminados_detalles: [],
  verificado: 0,
  _method: "POST",
});

export const useDevolucionStocks = () => {
  const setDevolucionStock = (item = null) => {
    if (item) {
      oDevolucionStock.value.id = item.id;
      oDevolucionStock.value.sucursal_id = item.sucursal_id;
      oDevolucionStock.value.fecha = item.fecha;
      oDevolucionStock.value.hora = item.hora;
      oDevolucionStock.value.observaciones = item.observaciones;
      oDevolucionStock.value.cantidad_total = item.cantidad_total;
      oDevolucionStock.value.total = item.total;
      oDevolucionStock.value.estado = item.estado;
      oDevolucionStock.value.verificado = item.verificado;
      oDevolucionStock.value.user_id = item.user_id;
      oDevolucionStock.value.devolucion_stock_detalles =
        item.devolucion_stock_detalles;
      oDevolucionStock.value.eliminados_detalles = [];
      oDevolucionStock.value._method = "PUT";
      return oDevolucionStock;
    }
    return false;
  };

  const limpiarDevolucionStock = () => {
    oDevolucionStock.value.id = 0;
    oDevolucionStock.value.sucursal_id = "";
    oDevolucionStock.value.fecha = "";
    oDevolucionStock.value.hora = "";
    oDevolucionStock.value.observaciones = "";
    oDevolucionStock.value.cantidad_total = "";
    oDevolucionStock.value.total = "CON FATURA";
    oDevolucionStock.value.estado = "";
    oDevolucionStock.value.verificado = "";
    oDevolucionStock.value.user_id = "";
    oDevolucionStock.value.devolucion_stock_detalles = [];
    oDevolucionStock.value.eliminados_detalles = [];
    oDevolucionStock.value._method = "POST";
  };

  onMounted(() => {});

  return {
    oDevolucionStock,
    setDevolucionStock,
    limpiarDevolucionStock,
  };
};
