import { onMounted, ref } from "vue";

const oCliente = ref({
  id: 0,
  razon_social: "",
  tipo: "",
  nit: "",
  nombre_punto: "",
  nombre_prop: "",
  ci_prop: "",
  correo: "",
  cel: "",
  fono: "",
  dir: "",
  ubicacion: "",
  ciudad: "",
  contactos: [],
  estado: 1,
  rank: "",
  categoria: "",
  score: "",
  factor: "",
  _method: "POST",
});

export const useClientes = () => {
  const setCliente = (item = null, ver = false) => {
    if (item) {
      oCliente.value.id = item.id;
      oCliente.value.razon_social = item.razon_social;
      oCliente.value.tipo = item.tipo;
      oCliente.value.nit = item.nit;
      oCliente.value.nombre_punto = item.nombre_punto;
      oCliente.value.nombre_prop = item.nombre_prop;
      oCliente.value.ci_prop = item.ci_prop;
      oCliente.value.correo = item.correo;
      oCliente.value.cel = item.cel;
      oCliente.value.fono = item.fono;
      oCliente.value.dir = item.dir;
      oCliente.value.ubicacion = item.ubicacion;
      oCliente.value.ciudad = item.ciudad;
      oCliente.value.contactos = item.contactos;
      oCliente.value.estado = item.estado;
      oCliente.value.rank = item.rank;
      oCliente.value.categoria = item.categoria;
      oCliente.value.score = item.score;
      oCliente.value.factor = item.factor;
      oCliente.value._method = "PUT";
      return oCliente;
    }
    return false;
  };

  const limpiarCliente = () => {
    oCliente.value.id = 0;
    oCliente.value.razon_social = "";
    oCliente.value.tipo = "PERSONA";
    oCliente.value.nit = "";
    oCliente.value.nombre_punto = "";
    oCliente.value.nombre_prop = "";
    oCliente.value.ci_prop = "";
    oCliente.value.correo = "";
    oCliente.value.cel = "";
    oCliente.value.fono = "";
    oCliente.value.dir = "";
    oCliente.value.ubicacion = "";
    oCliente.value.ciudad = "";
    oCliente.value.contactos = [
      { nombre: "", fono: "", cel: "", observacion: "" },
    ];
    oCliente.value.rank = "";
    oCliente.value.categoria = "";
    oCliente.value.score = "";
    oCliente.value.factor = "";
    oCliente.value.estado = 1;
    oCliente.value._method = "POST";
  };

  onMounted(() => {});

  return {
    oCliente,
    setCliente,
    limpiarCliente,
  };
};
