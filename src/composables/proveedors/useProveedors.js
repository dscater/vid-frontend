import { onMounted, ref } from "vue";

const oProveedor = ref({
  id: 0,
  razon_social: "",
  nombre_com: "",
  nit: "",
  moneda: "",
  fono_emp: "",
  correo: "",
  dir: "",
  ciudad: "",
  tipo: "",
  estado: "",
  observaciones: "",
  categorias: [],
  marcas: [],
  contactos: [],
  _method: "POST",
});

export const useProveedors = () => {
  const setProveedor = (item = null, ver = false) => {
    if (item) {
      oProveedor.value.id = item.id;
      oProveedor.value.razon_social = item.razon_social;
      oProveedor.value.nombre_com = item.nombre_com;
      oProveedor.value.nit = item.nit;
      oProveedor.value.moneda = item.moneda;
      oProveedor.value.fono_emp = item.fono_emp;
      oProveedor.value.correo = item.correo;
      oProveedor.value.dir = item.dir;
      oProveedor.value.ciudad = item.ciudad;
      oProveedor.value.tipo = item.tipo;
      oProveedor.value.estado = item.estado;
      oProveedor.value.observaciones = item.observaciones;
      oProveedor.value.categorias = item.categorias;
      oProveedor.value.marcas = item.marcas;
      oProveedor.value.contactos = item.contactos;
      oProveedor.value._method = "PUT";
      return oProveedor;
    }
    return false;
  };

  const limpiarProveedor = () => {
    oProveedor.value.id = 0;
    oProveedor.value.razon_social = "";
    oProveedor.value.nombre_com = "";
    oProveedor.value.nit = "";
    oProveedor.value.moneda = "";
    oProveedor.value.fono_emp = "";
    oProveedor.value.correo = "";
    oProveedor.value.dir = "";
    oProveedor.value.ciudad = "";
    oProveedor.value.tipo = "PRODUCTOS";
    oProveedor.value.estado = 1;
    oProveedor.value.observaciones = "";
    oProveedor.value.categorias = [];
    oProveedor.value.marcas = [];
    oProveedor.value.contactos = [
      { nombre: "", fono: "", cel: "", observacion: "" },
    ];
    oProveedor.value._method = "POST";
  };

  onMounted(() => {});

  return {
    oProveedor,
    setProveedor,
    limpiarProveedor,
  };
};
