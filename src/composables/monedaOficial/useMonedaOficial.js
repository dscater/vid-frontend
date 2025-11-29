import axios from "axios";
import { onMounted, ref } from "vue";

export const useMonedaOficial = () => {
    const monedaOficial = ref(null);
    const cargarMonedaOficial = () => {
        axios.get(route("monedas.getMonedaOficial")).then((response) => {
            monedaOficial.value = response.data;
        });
    };

    onMounted(() => {
        cargarMonedaOficial();
    });

    return {
        monedaOficial,
    };
};
