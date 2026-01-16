import { onMounted, ref } from "vue";

const oUsuario = ref({
  id: 0,
  usuario: "",
  nombre: "",
  paterno: "",
  materno: "",
  ci: "",
  ci_exp: "",
  grupo_san: "",
  sexo: "",
  nacionalidad: "",
  profesion: "",
  cel: "",
  fono: "",
  cel_dom: "",
  dir: "",
  ubicacion: "",
  correo: "",
  foto: "",
  carnet: "",
  password: "",
  tipo: "USUARIO",
  role_id: "",
  acceso: "" + 0,
  //   certificados
  certificados: [],
  certificados_eliminados: [],
  documentos: [],
  documentos_eliminados: [],
  _method: "POST",
});

export const useUsuarios = () => {
  const setUsuario = (item = null, ver = false) => {
    if (item) {
      oUsuario.value.id = item.id;
      oUsuario.value.usuario = item.usuario;
      oUsuario.value.nombre = item.nombre;
      oUsuario.value.paterno = item.paterno;
      oUsuario.value.materno = item.materno;
      oUsuario.value.ci = item.ci;
      oUsuario.value.ci_exp = item.ci_exp;
      oUsuario.value.grupo_san = item.grupo_san;
      oUsuario.value.sexo = item.sexo;
      oUsuario.value.nacionalidad = item.nacionalidad;
      oUsuario.value.profesion = item.profesion;
      oUsuario.value.cel = item.cel;
      oUsuario.value.fono = item.fono;
      oUsuario.value.cel_dom = item.cel_dom;
      oUsuario.value.dir = item.dir;
      oUsuario.value.ubicacion = item.ubicacion;
      oUsuario.value.correo = item.correo;
      // oUsuario.value.foto = item.foto;
      oUsuario.value.url_foto = item.url_foto;
      oUsuario.value.txt_foto = item.txt_foto;
      // oUsuario.value.carnet = item.carnet;
      oUsuario.value.url_carnet = item.url_carnet;
      oUsuario.value.txt_carnet = item.txt_carnet;
      oUsuario.value.doc_adicional = item.doc_adicional;
      // oUsuario.value.password = item.password;
      oUsuario.value.tipo = item.tipo;
      oUsuario.value.role_id = item.role_id;
      oUsuario.value.acceso = "" + item.acceso;
      oUsuario.value.certificados = item.certificados;
      oUsuario.value.certificados_eliminados = [];
      oUsuario.value.documentos = item.documentos;
      oUsuario.value.documentos_eliminados = [];
      oUsuario.value._method = "PUT";
      return oUsuario;
    }
    return false;
  };

  const limpiarUsuario = () => {
    oUsuario.value.id = 0;
    oUsuario.value.usuario = "";
    oUsuario.value.nombre = "";
    oUsuario.value.paterno = "";
    oUsuario.value.materno = "";
    oUsuario.value.ci = "";
    oUsuario.value.ci_exp = "";
    oUsuario.value.grupo_san = "";
    oUsuario.value.sexo = "";
    oUsuario.value.nacionalidad = "";
    oUsuario.value.profesion = "";
    oUsuario.value.cel = "";
    oUsuario.value.fono = "";
    oUsuario.value.cel_dom = "";
    oUsuario.value.dir = "";
    oUsuario.value.ubicacion = "";
    oUsuario.value.correo = "";
    oUsuario.value.foto = "";
    oUsuario.value.url_foto = "";
    oUsuario.value.txt_foto = "";
    oUsuario.value.carnet = "";
    oUsuario.value.url_carnet = "";
    oUsuario.value.txt_carnet = "";
    oUsuario.value.doc_adicional = "";
    oUsuario.value.password = "";
    oUsuario.value.tipo = "USUARIO";
    oUsuario.value.role_id = "";
    oUsuario.value.acceso = "" + 0;
    oUsuario.value.documentos = [];
    oUsuario.value.documentos_eliminados = [];
    oUsuario.value.certificados = [];
    oUsuario.value.certificados_eliminados = [];
    oUsuario._method = "POST";
  };

  onMounted(() => {});

  return {
    oUsuario,
    setUsuario,
    limpiarUsuario,
  };
};
