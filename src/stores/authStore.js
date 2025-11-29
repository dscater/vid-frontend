import { defineStore } from "pinia";
import api, { setAuthToken } from "../composables/axios";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null,
    loading: false,
    errors: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(form) {
      this.loading = true;
      this.errors = null;
      try {
        const res = await api.post("/login", {
          usuario: form.usuario,
          password: form.password,
        });

        this.token = res.data.access_token;
        this.user = res.data.user;
        localStorage.setItem("token", this.token);
        localStorage.setItem("user", JSON.stringify(this.user));
        setAuthToken(this.token);
      } catch (err) {
        this.errors = err.response?.data?.error || "Error en login";
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAuthToken(null);
    },
  },
});
