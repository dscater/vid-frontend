import { defineStore } from "pinia";
import api, { setAuthToken } from "../composables/axios";
import { useConnectivityStore } from "./offlineStores/useConnectivityStore";

export const useNotificacionStore = defineStore("notificacionStore", {
  state: () => ({
    notificacions: [],
    connectivityStore: useConnectivityStore(),
  }),
  getters: {},
  actions: {
    async cargarNotificacions() {
      try {
        if (!this.connectivityStore.isOnline) {
          return true;
        }
        const res = await api.get("/admin/notificacions/listadoByUserNoVisto");
        const data = res.data;
        this.notificacions = data.notificacions;
        // console.log(this.notificacions);
      } catch (err) {
        console.log(err);
        // this.notificacions = [];
        if (err.status === 401) {
          this.logout();
          // window.location.reload();
        }
      }
    },
  },
});
