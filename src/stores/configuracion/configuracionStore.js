import axios from "axios";
import { defineStore } from "pinia";
import api, { setAuthToken } from "../../composables/axios.js";
export const useConfiguracionStore = defineStore("configuracion", {
  state: () => ({
    oConfiguracion: {
      sistema: "SISTEMA HOTEL",
      alias: "SH",
      url_logo: "",
    },
  }),
  actions: {
    async initConfiguracion() {
      try {
        const res = await api.get("/configuracions/getConfiguracion");
        this.setConfiguracion(res.data.configuracion);
      } catch (error) {
        console.log(error);
      }
    },
    setConfiguracion(value) {
      this.oConfiguracion = { ...value };
    },
  },
  getters: {
    getConfiguracion() {
      return this.oConfiguracion;
    },
  },
});
