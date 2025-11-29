import { onMounted, ref } from "vue";

const oTipoHabitacion = ref({
    id: 0,
    nombre: "",
    capacidad: "",
    descripcion: "",
    _method: "POST",
});

export const useTipoHabitacions = () => {
    const setTipoHabitacion = (item = null, ver = false) => {
        if (item) {
            oTipoHabitacion.value.id = item.id;
            oTipoHabitacion.value.nombre = item.nombre;
            oTipoHabitacion.value.capacidad = item.capacidad;
            oTipoHabitacion.value.descripcion = item.descripcion;
            oTipoHabitacion.value._method = "PUT";
            return oTipoHabitacion;
        }
        return false;
    };

    const limpiarTipoHabitacion = () => {
        oTipoHabitacion.value.id = 0;
        oTipoHabitacion.value.nombre = "";
        oTipoHabitacion.value.capacidad = "";
        oTipoHabitacion.value.descripcion = "";
        oTipoHabitacion.value._method = "POST";
    };

    onMounted(() => {});

    return {
        oTipoHabitacion,
        setTipoHabitacion,
        limpiarTipoHabitacion,
    };
};
