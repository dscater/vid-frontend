import { onMounted, ref } from "vue";

const oProducto = ref({
  id: 0,
  codigo: "",
  nombre: "",
  unidades_caja: "",
  descripcion: "",
  categoria_id: "",
  marca_id: "",
  precio: "",
  precio_ppp: "",
  ppp: "",
  unidad_medida_id: "",
  estado: 1,
  imagen: "",
  url_imagen: "",
  txt_imagen: "",
  _method: "POST",
});

export const useProductos = () => {
  const setProducto = (item = null, ver = false) => {
    if (item) {
      oProducto.value.id = item.id;
      oProducto.value.codigo = item.codigo;
      oProducto.value.nombre = item.nombre;
      oProducto.value.unidades_caja = item.unidades_caja;
      oProducto.value.descripcion = item.descripcion;
      oProducto.value.categoria_id = item.categoria_id;
      oProducto.value.marca_id = item.marca_id;
      oProducto.value.precio = item.precio;
      oProducto.value.precio_ppp = item.precio_ppp;
      oProducto.value.ppp = item.ppp;
      oProducto.value.unidad_medida_id = item.unidad_medida_id;
      oProducto.value.estado = item.estado;
      oProducto.value.imagen = null;
      oProducto.value.url_imagen = item.url_imagen;
      oProducto.value.txt_imagen = item.txt_imagen;
      oProducto.value._method = "PUT";
      return oProducto;
    }
    return false;
  };

  const limpiarProducto = () => {
    oProducto.value.id = 0;
    oProducto.value.codigo = "";
    oProducto.value.nombre = "";
    oProducto.value.unidades_caja = "";
    oProducto.value.descripcion = "";
    oProducto.value.categoria_id = "";
    oProducto.value.marca_id = "";
    oProducto.value.precio = "";
    oProducto.value.precio_ppp = "";
    oProducto.value.ppp = "";
    oProducto.value.unidad_medida_id = "";
    oProducto.value.estado = 1;
    oProducto.value.imagen = "";
    oProducto.value.url_imagen = "";
    oProducto.value.txt_imagen = "";
    oProducto.value._method = "POST";
  };

  onMounted(() => {});

  return {
    oProducto,
    setProducto,
    limpiarProducto,
  };
};
