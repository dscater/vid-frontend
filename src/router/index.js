import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/authStore";

// LAYOUTS
import Auth from "../layouts/Auth.vue";
import Admin from "../layouts/Admin.vue";

const routes = [
  // USUARIOS
  {
    path: "/admin/usuarios",
    name: "usuarios.index",
    component: () => import("../pages/admin/usuarios/Index.vue"),
    meta: { layout: Admin, requiresAuth: true },
  },
  // ROLES
  {
    path: "/admin/roles",
    name: "roles.index",
    component: () => import("../pages/admin/roles/Index.vue"),
    meta: { layout: Admin, requiresAuth: true },
  },

  // CONFIGURACIÓN
  {
    path: "/admin/configuracions",
    name: "configuracions.index",
    component: () => import("../pages/admin/configuracions/Index.vue"),
    meta: { layout: Admin, requiresAuth: true },
  },

  // PRODUCTOS
  {
    path: "/admin/productos",
    name: "productos.index",
    component: () => import("../pages/admin/productos/Index.vue"),
    meta: { layout: Admin, requiresAuth: true },
  },

  // LOGIN
  {
    path: "/login",
    name: "Login",
    component: () => import("../pages/auth/Login.vue"),
    meta: { layout: Auth, guest: true },
  },

  // INICIO
  {
    path: "/admin/inicio",
    name: "Inicio",
    component: () => import("../pages/admin/Inicio.vue"),
    meta: { layout: Admin, requiresAuth: true },
  },

  // Redirección base
  {
    path: "/",
    redirect: "/login",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
// Guard global
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  // Rutas protegidas
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log("LOGIN");
    return next({ name: "Login" });
  }

  // Logeado y quiere ir al login
  if (to.meta.guest && authStore.isAuthenticated) {
    console.log("INICIO");
    return next({ name: "Inicio" });
  }

  next();
});

export default router;
