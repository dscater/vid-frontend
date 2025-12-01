import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/authStore";

// LAYOUTS
import Auth from "../layouts/Auth.vue";
import Admin from "../layouts/Admin.vue";

const routes = [
  // PROFILE
  {
    path: "/admin/profile/:id",
    name: "profile.edit",
    props: true,
    component: () => import("../pages/admin/profile/Edit.vue"),
    meta: { layout: Admin, requiresAuth: true },
  },
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

import { validateToken } from "../composables/auth";
// Guard global
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const token = localStorage.getItem("token");
  // Si la ruta requiere auth
  if (to.meta.requiresAuth) {
    authStore.verificaSesion();
    if (!token) {
      return next({ name: "Login" });
    }
    return next();
  }

  // Si la ruta es guest y ya está logeado → bloquear
  if (to.meta.guest && authStore.isAuthenticated) {
    return next({ name: "Inicio" });
  }
  next();
});

export default router;
