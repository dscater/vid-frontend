import { onMounted, ref } from "vue";

const oSolicitudIngreso = ref({
  id: 0,
  nro: "",
  codigo: "",
  proveedor_id: "",
  fecha_ingreso: "",
  hora_ingreso: "",
  fecha_sis: "",
  hora_sis: "",
  cs_f: "",
  tipo_cambio: "",
  gastos: "",
  observaciones: "",
  descripcion: "",
  cantidad_total: "",
  total: "",
  estado: "",
  user_id: "",
  solicitud_ingreso_detalles: [],
  eliminados_detalles: [],
  verificado: 0,
  _method: "POST",
});

export const useSolicitudIngresos = () => {
  const setSolicitudIngreso = (item = null) => {
    if (item) {
      oSolicitudIngreso.value.id = item.id;
      oSolicitudIngreso.value.nro = item.nro;
      oSolicitudIngreso.value.codigo = item.codigo;
      oSolicitudIngreso.value.proveedor_id = item.proveedor_id;
      oSolicitudIngreso.value.fecha_ingreso = item.fecha_ingreso;
      oSolicitudIngreso.value.hora_ingreso = item.hora_ingreso;
      oSolicitudIngreso.value.fecha_sis = item.fecha_sis;
      oSolicitudIngreso.value.hora_sis = item.hora_sis;
      oSolicitudIngreso.value.cs_f = item.cs_f;
      oSolicitudIngreso.value.tipo_cambio = item.tipo_cambio;
      oSolicitudIngreso.value.gastos = item.gastos;
      oSolicitudIngreso.value.observaciones = item.observaciones;
      oSolicitudIngreso.value.descripcion = item.descripcion;
      oSolicitudIngreso.value.cantidad_total = item.cantidad_total;
      oSolicitudIngreso.value.total = item.total;
      oSolicitudIngreso.value.estado = item.estado;
      oSolicitudIngreso.value.user_id = item.user_id;
      oSolicitudIngreso.value.verificado = item.verificado;
      oSolicitudIngreso.value.solicitud_ingreso_detalles =
        item.solicitud_ingreso_detalles;
      oSolicitudIngreso.value.eliminados_detalles = [];
      oSolicitudIngreso.value._method = "PUT";
      return oSolicitudIngreso;
    }
    return false;
  };

  const limpiarSolicitudIngreso = () => {
    oSolicitudIngreso.value.id = 0;
    oSolicitudIngreso.value.nro = "";
    oSolicitudIngreso.value.codigo = "";
    oSolicitudIngreso.value.proveedor_id = "";
    oSolicitudIngreso.value.fecha_ingreso = "";
    oSolicitudIngreso.value.hora_ingreso = "";
    oSolicitudIngreso.value.fecha_sis = "";
    oSolicitudIngreso.value.hora_sis = "";
    oSolicitudIngreso.value.cs_f = "CON FATURA";
    oSolicitudIngreso.value.tipo_cambio = "";
    oSolicitudIngreso.value.gastos = "";
    oSolicitudIngreso.value.observaciones = "";
    oSolicitudIngreso.value.descripcion = "";
    oSolicitudIngreso.value.cantidad_total = 0;
    oSolicitudIngreso.value.total = 0;
    oSolicitudIngreso.value.estado = "";
    oSolicitudIngreso.value.user_id = "";
    oSolicitudIngreso.value.verificado = 0;
    oSolicitudIngreso.value.solicitud_ingreso_detalles = [];
    oSolicitudIngreso.value.eliminados_detalles = [];
    oSolicitudIngreso.value._method = "POST";
  };

  onMounted(() => {});

  return {
    oSolicitudIngreso,
    setSolicitudIngreso,
    limpiarSolicitudIngreso,
  };
};
