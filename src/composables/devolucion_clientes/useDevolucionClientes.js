import { onMounted, ref } from "vue";

import { useAuthStore } from "../../stores/authStore";
const oDevolucionCliente = ref({
  id: 0,
  sucursal_id: "",
  cliente_id: "",
  cantidad_total: "",
  total: "",
  fecha: "",
  hora: "",
  observaciones: "",
  user_id: "",
  devolucion_cliente_detalles: [],
  eliminados_detalles: [],
  _method: "POST",
});

export const useDevolucionClientes = () => {
  const authStore = useAuthStore();
  const setDevolucionCliente = (item = null) => {
    if (item) {
      oDevolucionCliente.value.id = item.id;
      oDevolucionCliente.value.sucursal_id = item.sucursal_id;
      oDevolucionCliente.value.cliente_id = item.cliente_id;
      oDevolucionCliente.value.cantidad_total = item.cantidad_total;
      oDevolucionCliente.value.total = item.total;
      oDevolucionCliente.value.fecha = item.fecha;
      oDevolucionCliente.value.hora = item.hora;
      oDevolucionCliente.value.observaciones = item.observaciones;
      oDevolucionCliente.value.user_id = item.user_id;
      oDevolucionCliente.value.devolucion_cliente_detalles =
        item.devolucion_cliente_detalles;
      oDevolucionCliente.value.eliminados_detalles = [];
      oDevolucionCliente.value._method = "PUT";
      return oDevolucionCliente;
    }
    return false;
  };

  const limpiarDevolucionCliente = () => {
    oDevolucionCliente.value.id = 0;
    oDevolucionCliente.value.sucursal_id = authStore?.user.sucursal_asignada
      ? authStore?.user.sucursal_asignada.id
      : "";
    oDevolucionCliente.value.cliente_id = "";
    oDevolucionCliente.value.cantidad_total = "";
    oDevolucionCliente.value.total = "";
    oDevolucionCliente.value.fecha = "";
    oDevolucionCliente.value.hora = "";
    oDevolucionCliente.value.observaciones = "";
    oDevolucionCliente.value.user_id = "";
    oDevolucionCliente.value.devolucion_cliente_detalles = [];
    oDevolucionCliente.value.eliminados_detalles = [];
    oDevolucionCliente.value._method = "POST";
  };

  onMounted(() => {});

  return {
    oDevolucionCliente,
    setDevolucionCliente,
    limpiarDevolucionCliente,
  };
};
