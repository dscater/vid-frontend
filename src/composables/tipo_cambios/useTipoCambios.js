import { onMounted, ref } from "vue";

const oTipoCambio = ref({
    id: 0,
    moneda_id: "",
    fecha: "",
    valor: 0,
    _method: "POST",
});

export const useTipoCambios = () => {
    const setTipoCambio = (item = null, ver = false) => {
        if (item) {
            oTipoCambio.value.id = item.id;
            oTipoCambio.value.moneda_id = item.moneda_id;
            oTipoCambio.value.fecha = item.fecha;
            oTipoCambio.value.valor = Number(item.valor);
            oTipoCambio.value._method = "PUT";
            return oTipoCambio;
        }
        return false;
    };

    const limpiarTipoCambio = () => {
        oTipoCambio.value.id = 0;
        oTipoCambio.value.moneda_id = "";
        oTipoCambio.value.fecha = "";
        oTipoCambio.value.valor = 0;
        oTipoCambio.value._method = "POST";
    };

    onMounted(() => {});

    return {
        oTipoCambio,
        setTipoCambio,
        limpiarTipoCambio,
    };
};
