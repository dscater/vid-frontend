import axios from "axios";
import { defineStore } from "pinia";
import api, { setAuthToken } from "../../composables/axios.js";
export const useConfiguracionStore = defineStore("configuracion", {
  state: () => ({
    oConfiguracion: JSON.parse(localStorage.getItem("configuracion")) || {
      nombre_sistema: "SISTEMA VID",
      alias: "VD",
      logo: "logo.png",
      url_logo: "",
      logo_b64: "b64",
    },
  }),
  actions: {
    async initConfiguracion() {
      try {
        const res = await api.get("/configuracions/getConfiguracion");
        localStorage.setItem(
          "configuracion",
          JSON.stringify(res.data.configuracion)
        );
        this.setConfiguracion(res.data.configuracion);
      } catch (error) {
        console.log(error);
      }
    },
    setConfiguracion(value) {
      localStorage.setItem("configuracion", JSON.stringify({ ...value }));
      this.oConfiguracion = { ...value };
    },
  },
  getters: {
    getConfiguracion() {
      return this.oConfiguracion;
    },
  },
});
