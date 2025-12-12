// import { usePage } from "@inertiajs/vue3";
import { defineStore } from "pinia";

export const useAppStore = defineStore("app_store", {
  state: () => ({
    loading: true,
    sync: false,
    delayLoading: 300,
    user: null,
  }),
  actions: {
    initUserInfo() {
      // this.user = usePage().props.auth.user ?? null;
    },
    setLoading(value) {
      this.loading = value;
    },
    startLoading() {
      this.loading = true;
    },
    setSync(value) {
      this.sync = value;
    },
    async stopLoading() {
      await this.esperarCargaElementos();
      setTimeout(() => {
        this.loading = false;
      }, this.delayLoading);
    },
    setDelayLoading(value) {
      this.delayLoading = value;
    },
    async esperarCargaElementos() {
      return new Promise((resolve) => window.requestAnimationFrame(resolve));
    },
  },
  getters: {
    getLoading() {
      return this.loading;
    },
    getSync() {
      return Boolean(this.loading);
    },
    getDelayLoading() {
      return this.delayLoading;
    },
    getUsuario() {
      return this.user;
    },
  },
});
