import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/authStore";

// LAYOUTS
import Auth from "../layouts/Auth.vue";
import Admin from "../layouts/Admin.vue";

const routes = [
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
  // PROFILE
  {
    path: "/admin/profile/:id",
    name: "profile.edit",
    props: true,
    component: () => import("../pages/admin/profile/Edit.vue"),
    meta: { layout: Admin, requiresAuth: true },
  },

  // CONFIGURACIÓN
  {
    path: "/admin/configuracions",
    name: "configuracions.index",
    component: () => import("../pages/admin/configuracions/Index.vue"),
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
  {
    path: "/admin/roles/permisos/:id",
    name: "roles.edit",
    props: true,
    component: () => import("../pages/admin/roles/Permisos.vue"),
    meta: { layout: Admin, requiresAuth: true },
  },

  // SUCURSALES
  {
    path: "/admin/sucursals",
    name: "sucursals.index",
    component: () => import("../pages/admin/sucursals/Index.vue"),
    meta: { layout: Admin, requiresAuth: true },
  },

  // CATEGORIAS
  {
    path: "/admin/categorias",
    name: "categorias.index",
    component: () => import("../pages/admin/categorias/Index.vue"),
    meta: { layout: Admin, requiresAuth: true },
  },

  // SUBCATEGORIAS
  {
    path: "/admin/sub_categorias",
    name: "sub_categorias.index",
    component: () => import("../pages/admin/sub_categorias/Index.vue"),
    meta: { layout: Admin, requiresAuth: true },
  },

  // MARCAS
  {
    path: "/admin/marcas",
    name: "marcas.index",
    component: () => import("../pages/admin/marcas/Index.vue"),
    meta: { layout: Admin, requiresAuth: true },
  },

  // UNIDADES DE MEDIDA
  {
    path: "/admin/unidad_medidas",
    name: "unidad_medidas.index",
    component: () => import("../pages/admin/unidad_medidas/Index.vue"),
    meta: { layout: Admin, requiresAuth: true },
  },
  // PRODUCTOS
  {
    path: "/admin/productos",
    name: "productos.index",
    component: () => import("../pages/admin/productos/Index.vue"),
    meta: { layout: Admin, requiresAuth: true },
  },

  // CLIENTES
  {
    path: "/admin/clientes",
    name: "clientes.index",
    component: () => import("../pages/admin/clientes/Index.vue"),
    meta: { layout: Admin, requiresAuth: true },
  },

  // PROVEEDORES
  {
    path: "/admin/proveedors",
    name: "proveedors.index",
    component: () => import("../pages/admin/proveedors/Index.vue"),
    meta: { layout: Admin, requiresAuth: true },
  },

  // SOLICITUD DE INGRESOS
  {
    path: "/admin/solicitud_ingresos",
    name: "solicitud_ingresos.index",
    component: () => import("../pages/admin/solicitud_ingresos/Index.vue"),
    meta: { layout: Admin, requiresAuth: true },
  },

  // ORDEN DE SALIDAS
  {
    path: "/admin/orden_salidas",
    name: "orden_salidas.index",
    component: () => import("../pages/admin/orden_salidas/Index.vue"),
    meta: { layout: Admin, requiresAuth: true },
  },

  // DEVOLUCION DE STOCKS
  {
    path: "/admin/devolucion_stocks",
    name: "devolucion_stocks.index",
    component: () => import("../pages/admin/devolucion_stocks/Index.vue"),
    meta: { layout: Admin, requiresAuth: true },
  },

  // ORDEN DE VENTAS
  {
    path: "/admin/orden_ventas",
    name: "orden_ventas.index",
    component: () => import("../pages/admin/orden_ventas/Index.vue"),
    meta: { layout: Admin, requiresAuth: true },
  },

  // TRANSFERENCIAS
  {
    path: "/admin/transferencias",
    name: "transferencias.index",
    component: () => import("../pages/admin/transferencias/Index.vue"),
    meta: { layout: Admin, requiresAuth: true },
  },

  // DEVOLUCION DE CLIENTES
  {
    path: "/admin/devolucion_clientes",
    name: "devolucion_clientes.index",
    component: () => import("../pages/admin/devolucion_clientes/Index.vue"),
    meta: { layout: Admin, requiresAuth: true },
  },

  // CUENTAS POR COBRAR
  {
    path: "/admin/cuenta_cobrars",
    name: "cuenta_cobrars.index",
    component: () => import("../pages/admin/cuenta_cobrars/Index.vue"),
    meta: { layout: Admin, requiresAuth: true },
  },

  // GASTOS
  {
    path: "/admin/gastos",
    name: "gastos.index",
    component: () => import("../pages/admin/gastos/Index.vue"),
    meta: { layout: Admin, requiresAuth: true },
  },

  // PROFORMAS
  {
    path: "/admin/proformas",
    name: "proformas.index",
    component: () => import("../pages/admin/proformas/Index.vue"),
    meta: { layout: Admin, requiresAuth: true },
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
