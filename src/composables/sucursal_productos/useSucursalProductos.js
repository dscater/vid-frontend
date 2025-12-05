import { onMounted, ref } from "vue";

const oSucursalProducto = ref({
  id: 0,
  sucursal_id: "",
  producto_id: "",
  cantidad_ideal: "",
  cantidad_minima: "",
  stock_actual: "",
  _method: "POST",
});

export const useSucursalProductos = () => {
  const setSucursalProducto = (item = null) => {
    if (item) {
      oSucursalProducto.value.id = item.id;
      oSucursalProducto.value.sucursal_id = item.sucursal_id;
      oSucursalProducto.value.producto_id = item.producto_id;
      oSucursalProducto.value.cantidad_ideal = item.cantidad_ideal;
      oSucursalProducto.value.cantidad_minima = item.cantidad_minima;
      oSucursalProducto.value.stock_actual = item.stock_actual;
      oSucursalProducto.value._method = "PUT";
      return oSucursalProducto;
    }
    return false;
  };

  const limpiarSucursalProducto = () => {
    oSucursalProducto.value.id = 0;
    oSucursalProducto.value.sucursal_id = "";
    oSucursalProducto.value.producto_id = "";
    oSucursalProducto.value.cantidad_ideal = "";
    oSucursalProducto.value.cantidad_minima = "";
    oSucursalProducto.value.stock_actual = "";
    oSucursalProducto.value._method = "POST";
  };

  onMounted(() => {});

  return {
    oSucursalProducto,
    setSucursalProducto,
    limpiarSucursalProducto,
  };
};
