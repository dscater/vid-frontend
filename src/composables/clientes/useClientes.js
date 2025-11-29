import { onMounted, ref } from "vue";

const oCliente = ref({
    id: 0,
    nombre: "",
    paterno: "",
    materno: "",
    ci: "",
    ci_exp: "",
    dir: "",
    fono: "",
    fecha_nac: "",
    correo: "",
    edad: "",
    nacionalidad: "",
    pais: "",
    respuesta: "",
    _method: "POST",
});

export const useClientes = () => {
    const setCliente = (item = null, ver = false) => {
        if (item) {
            oCliente.value.id = item.id;
            oCliente.value.nombre = item.nombre;
            oCliente.value.paterno = item.paterno;
            oCliente.value.materno = item.materno;
            oCliente.value.ci = item.ci;
            oCliente.value.ci_exp = item.ci_exp;
            oCliente.value.dir = item.dir;
            oCliente.value.fono = item.fono;
            oCliente.value.fecha_nac = item.fecha_nac;
            oCliente.value.correo = item.correo;
            oCliente.value.edad = item.edad;
            oCliente.value.nacionalidad = item.nacionalidad;
            oCliente.value.pais = item.pais;
            oCliente.value._method = "PUT";
            return oCliente;
        }
        return false;
    };

    const limpiarCliente = () => {
        oCliente.value.id = 0;
        oCliente.value.nombre = "";
        oCliente.value.paterno = "";
        oCliente.value.materno = "";
        oCliente.value.ci = "";
        oCliente.value.ci_exp = "";
        oCliente.value.dir = "";
        oCliente.value.fono = "";
        oCliente.value.fecha_nac = "";
        oCliente.value.correo = "";
        oCliente.value.edad = "";
        oCliente.value.nacionalidad = "";
        oCliente.value.pais = "";
        oCliente.value.respuesta = "";
        oCliente.value._method = "POST";
    };

    onMounted(() => {});

    return {
        oCliente,
        setCliente,
        limpiarCliente,
    };
};
