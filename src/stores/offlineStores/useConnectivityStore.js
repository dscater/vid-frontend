import { defineStore } from "pinia";
import { ref, onMounted } from "vue";

export const useConnectivityStore = defineStore("connectivity", () => {
  const isOnline = ref(navigator.onLine);

  const updateStatus = () => {
    isOnline.value = navigator.onLine;
  };

  // Función para iniciar la escucha de eventos
  const setupListeners = () => {
    window.addEventListener("online", updateStatus);

    window.addEventListener("offline", updateStatus);
  };

  const cleanupListeners = () => {
    window.removeEventListener("online", updateStatus);
    window.removeEventListener("offline", updateStatus);
  };

  setupListeners();

  return {
    isOnline,
    updateStatus,
  };
});
