import { onMounted, ref } from "vue";

const oHabitacion = ref({
    id: 0,
    numero_habitacion: "",
    tipo_habitacion_id: "",
    piso: 0,
    capacidad: 1,
    precio: 0,
    precio_temp: 0,
    estado: "",
    habitacion_fotos: [],
    eliminados_fotos: [],
    _method: "POST",
});

export const useHabitacions = () => {
    const setHabitacion = (item = null, ver = false) => {
        if (item) {
            oHabitacion.value.id = item.id;
            oHabitacion.value.numero_habitacion = item.numero_habitacion;
            oHabitacion.value.tipo_habitacion_id = item.tipo_habitacion_id;
            oHabitacion.value.piso = item.piso;
            oHabitacion.value.capacidad = item.capacidad;
            oHabitacion.value.precio = Number(item.precio);
            oHabitacion.value.precio_temp = Number(item.precio_temp);
            oHabitacion.value.estado = item.estado;
            oHabitacion.value.habitacion_fotos = item.habitacion_fotos;
            oHabitacion.value.eliminados_fotos = [];
            oHabitacion.value._method = "PUT";
            return oHabitacion;
        }
        return false;
    };

    const limpiarHabitacion = () => {
        oHabitacion.value.id = 0;
        oHabitacion.value.numero_habitacion = "";
        oHabitacion.value.tipo_habitacion_id = "";
        oHabitacion.value.piso = 0;
        oHabitacion.value.capacidad = 1;
        oHabitacion.value.precio = 0;
        oHabitacion.value.precio_temp = 0;
        oHabitacion.value.estado = "";
        oHabitacion.value.habitacion_fotos = [];
        oHabitacion.value.eliminados_fotos = [];
        oHabitacion.value._method = "POST";
    };

    onMounted(() => {});

    return {
        oHabitacion,
        setHabitacion,
        limpiarHabitacion,
    };
};
