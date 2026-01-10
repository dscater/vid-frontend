import { onMounted, ref } from "vue";

const oAjuste = ref({
  id: 0,
  sucursal_id: "",
  sucursal_origen: "",
  producto_id: "",
  cantidad: "",
  motivo: "",
  tipo: "",
  registro_id: "",
  _method: "POST",
});

export const useAjustes = () => {
  const setAjuste = (item = null, ver = false) => {
    if (item) {
      oAjuste.value.id = item.id;
      oAjuste.value.sucursal_id = item.sucursal_id;
      oAjuste.value.sucursal_origen = item.sucursal_origen;
      oAjuste.value.sucursal = item.sucursal;
      oAjuste.value.o_sucursal_origen = item.o_sucursal_origen;
      oAjuste.value.producto_id = item.producto_id;
      oAjuste.value.cantidad = item.cantidad;
      oAjuste.value.motivo = item.motivo;
      oAjuste.value.tipo = item.tipo;
      oAjuste.value.registro_id = item.registro_id;
      oAjuste.value._method = "PUT";
      return oAjuste;
    }
    return false;
  };

  const limpiarAjuste = () => {
    oAjuste.value.id = 0;
    oAjuste.value.sucursal_id = "";
    oAjuste.value.sucursal_origen = "";
    oAjuste.value.producto_id = "";
    oAjuste.value.cantidad = "";
    oAjuste.value.motivo = "";
    oAjuste.value.tipo = "";
    oAjuste.value.registro_id = "";
    oAjuste.value._method = "POST";
  };

  onMounted(() => {});

  return {
    oAjuste,
    setAjuste,
    limpiarAjuste,
  };
};
