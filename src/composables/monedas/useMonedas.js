import { onMounted, ref } from "vue";

const oMoneda = ref({
    id: 0,
    codigo: "",
    nombre: "",
    simbolo: "",
    _method: "POST",
});

export const useMonedas = () => {
    const setMoneda = (item = null, ver = false) => {
        if (item) {
            oMoneda.value.id = item.id;
            oMoneda.value.codigo = item.codigo;
            oMoneda.value.nombre = item.nombre;
            oMoneda.value.simbolo = item.simbolo;
            oMoneda.value._method = "PUT";
            return oMoneda;
        }
        return false;
    };

    const limpiarMoneda = () => {
        oMoneda.value.id = 0;
        oMoneda.value.codigo = "";
        oMoneda.value.nombre = "";
        oMoneda.value.simbolo = "";
        oMoneda.value._method = "POST";
    };

    onMounted(() => {});

    return {
        oMoneda,
        setMoneda,
        limpiarMoneda,
    };
};
