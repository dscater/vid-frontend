import axios from "axios";

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

export default api;
