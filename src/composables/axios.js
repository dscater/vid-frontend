import axios from "axios";
import { useAuthStore } from "../stores/authStore";

// Base URL de la API desde variable de entorno
const API_URL = import.meta.env.VITE_API_URL;

// Crear instancia de Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    // "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Helper para setear token de autorización
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

// interceptors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejo global de errores
    return Promise.reject(error);
  }
);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); //localstore
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;
