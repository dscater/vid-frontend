import { onMounted, ref } from "vue";

const oSucursal = ref({
  id: 0,
  nombre: "",
  direccion: "",
  fono: "",
  correo: "",
  user_id: "",
  monto_dia: "",
  estado: 1,
  _method: "POST",
});

export const useSucursals = () => {
  const setSucursal = (item = null, ver = false) => {
    if (item) {
      oSucursal.value.id = item.id;
      oSucursal.value.nombre = item.nombre;
      oSucursal.value.direccion = item.direccion;
      oSucursal.value.fono = item.fono;
      oSucursal.value.correo = item.correo;
      oSucursal.value.user_id = item.user_id;
      oSucursal.value.estado = item.estado;
      oSucursal.value.monto_dia = item.monto_dia;
      oSucursal.value._method = "PUT";
      return oSucursal;
    }
    return false;
  };

  const limpiarSucursal = () => {
    oSucursal.value.id = 0;
    oSucursal.value.nombre = "";
    oSucursal.value.direccion = "";
    oSucursal.value.fono = "";
    oSucursal.value.correo = "";
    oSucursal.value.user_id = "";
    oSucursal.value.estado = 1;
    oSucursal.value.monto_dia = 1;
    oSucursal.value._method = "POST";
  };

  onMounted(() => {});

  return {
    oSucursal,
    setSucursal,
    limpiarSucursal,
  };
};
