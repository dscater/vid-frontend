import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

// CSS
import "./assets/css/all.min.css";
import "./assets/css/adminlte.min.css";
import "./assets/css/config.css";
import "./assets/css/datatables.css";
import "./assets/css/form.css";
import "./assets/css/icheck-bootstrap.min.css";
import "./assets/css/miTable.css"; // mi-table

// mis scripts
import "./assets/js/jquery.min.js";
import "./assets/js/bootstrap.bundle.min.js";

// sweetalert2
import Swal from "sweetalert2";
window.Swal = Swal;

// Pinia
import { createPinia } from "pinia";

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(router);
app.mount("#app");

import { registerSW } from "virtual:pwa-register";
registerSW({
  immediate: true,
});

import { useAuthStore } from "./stores/authStore";
const authStore = useAuthStore();
authStore.verificaSesion();
