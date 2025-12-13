import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/authStore";

// LAYOUTS
import Auth from "../layouts/Auth.vue";
import Admin from "../layouts/Admin.vue";
// inicio
import Inicio from "../pages/admin/Inicio.vue";
// orden ventas
import IndexOrdenVentas from "../pages/admin/orden_ventas/Index.vue";
import CreateOrdenVentas from "../pages/admin/orden_ventas/Create.vue";
import EditOrdenVentas from "../pages/admin/orden_ventas/Edit.vue";
import ImprimirOrdenVentas from "../pages/admin/orden_ventas/Imprimir.vue";

// cuentas por cobrar
import IndexCuentaCobrars from "../pages/admin/cuenta_cobrars/Index.vue";

// clientes
import IndexClientes from "../pages/admin/clientes/Index.vue";

// proformas
import IndexProformas from "../pages/admin/proformas/Index.vue";
import CreateProformas from "../pages/admin/proformas/Create.vue";
import EditProformas from "../pages/admin/proformas/Edit.vue";
import ImprimirProformas from "../pages/admin/proformas/Imprimir.vue";

// devolucion clientes
import IndexDevolucionClientes from "../pages/admin/devolucion_clientes/Index.vue";

const routes = [
  // Redirección base
  {
    path: "/",
    // redirect: "/login",
    component: () => import("../pages/auth/Login.vue"),
    meta: { layout: Auth, guest: true },
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
    // component: () => import("../pages/admin/Inicio.vue"),
    component: Inicio,
    meta: { layout: Admin, requiresAuth: true },
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
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  // USUARIOS
  {
    path: "/admin/usuarios",
    name: "usuarios.index",
    component: () => import("../pages/admin/usuarios/Index.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  // ROLES
  {
    path: "/admin/roles",
    name: "roles.index",
    component: () => import("../pages/admin/roles/Index.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  {
    path: "/admin/roles/permisos/:id",
    name: "roles.edit",
    props: true,
    component: () => import("../pages/admin/roles/Permisos.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },

  // SUCURSALES
  {
    path: "/admin/sucursals",
    name: "sucursals.index",
    component: () => import("../pages/admin/sucursals/Index.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },

  // SUCURSAL PRODUCTOS
  {
    path: "/admin/sucursal_productos",
    name: "sucursal_productos.index",
    component: () => import("../pages/admin/sucursal_productos/Index.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },

  // CATEGORIAS
  {
    path: "/admin/categorias",
    name: "categorias.index",
    component: () => import("../pages/admin/categorias/Index.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },

  // SUBCATEGORIAS
  {
    path: "/admin/sub_categorias",
    name: "sub_categorias.index",
    component: () => import("../pages/admin/sub_categorias/Index.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },

  // MARCAS
  {
    path: "/admin/marcas",
    name: "marcas.index",
    component: () => import("../pages/admin/marcas/Index.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },

  // UNIDADES DE MEDIDA
  {
    path: "/admin/unidad_medidas",
    name: "unidad_medidas.index",
    component: () => import("../pages/admin/unidad_medidas/Index.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  // PRODUCTOS
  {
    path: "/admin/productos",
    name: "productos.index",
    component: () => import("../pages/admin/productos/Index.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },

  // CLIENTES
  {
    path: "/admin/clientes",
    name: "clientes.index",
    // component: () => import("../pages/admin/clientes/Index.vue"),
    component: IndexClientes,
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },

  // PROVEEDORES
  {
    path: "/admin/proveedors",
    name: "proveedors.index",
    component: () => import("../pages/admin/proveedors/Index.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },

  // SOLICITUD DE INGRESOS
  {
    path: "/admin/solicitud_ingresos",
    name: "solicitud_ingresos.index",
    component: () => import("../pages/admin/solicitud_ingresos/Index.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },

  // ORDEN DE SALIDAS
  {
    path: "/admin/orden_salidas",
    name: "orden_salidas.index",
    component: () => import("../pages/admin/orden_salidas/Index.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },

  // DEVOLUCION DE STOCKS
  {
    path: "/admin/devolucion_stocks",
    name: "devolucion_stocks.index",
    component: () => import("../pages/admin/devolucion_stocks/Index.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },

  // ORDEN DE VENTAS
  {
    path: "/admin/orden_ventas",
    name: "orden_ventas.index",
    // component: () => import("../pages/admin/orden_ventas/Index.vue"),
    component: IndexOrdenVentas,
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  {
    path: "/admin/orden_ventas/create",
    name: "orden_ventas.create",
    // component: () => import("../pages/admin/orden_ventas/Create.vue"),
    component: CreateOrdenVentas,
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  {
    path: "/admin/orden_ventas/:id",
    name: "orden_ventas.edit",
    props: true,
    // component: () => import("../pages/admin/orden_ventas/Edit.vue"),
    component: EditOrdenVentas,
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  {
    path: "/admin/orden_ventas/imprimir/:id",
    name: "orden_ventas.imprimir",
    props: true,
    // component: () => import("../pages/admin/orden_ventas/Imprimir.vue"),
    component: ImprimirOrdenVentas,
    meta: { layout: Admin, requiresAuth: true },
  },

  // TRANSFERENCIAS
  {
    path: "/admin/transferencias",
    name: "transferencias.index",
    component: () => import("../pages/admin/transferencias/Index.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },

  // DEVOLUCION DE CLIENTES
  {
    path: "/admin/devolucion_clientes",
    name: "devolucion_clientes.index",
    // component: () => import("../pages/admin/devolucion_clientes/Index.vue"),
    component: IndexDevolucionClientes,
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },

  // CUENTAS POR COBRAR
  {
    path: "/admin/cuenta_cobrars",
    name: "cuenta_cobrars.index",
    // component: () => import("../pages/admin/cuenta_cobrars/Index.vue"),
    component: IndexCuentaCobrars,
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },

  // GASTOS
  {
    path: "/admin/gastos",
    name: "gastos.index",
    component: () => import("../pages/admin/gastos/Index.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },

  // NOTIFICACIONES
  {
    path: "/admin/notificacions",
    name: "notificacions.index",
    component: () => import("../pages/admin/notificacions/Index.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  {
    path: "/admin/notificacions/:id",
    name: "notificacions.show",
    props: true,
    component: () => import("../pages/admin/notificacions/Show.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },

  // PROFORMAS
  {
    path: "/admin/proformas",
    name: "proformas.index",
    // component: () => import("../pages/admin/proformas/Index.vue"),
    component: IndexProformas,
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  {
    path: "/admin/proformas/create",
    name: "proformas.create",
    // component: () => import("../pages/admin/proformas/Create.vue"),
    component: CreateProformas,
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  {
    path: "/admin/proformas/:id",
    name: "proformas.edit",
    props: true,
    // component: () => import("../pages/admin/proformas/Edit.vue"),
    component: EditProformas,
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  {
    path: "/admin/proformas/imprimir/:id",
    name: "proformas.imprimir",
    props: true,
    // component: () => import("../pages/admin/proformas/Imprimir.vue"),
    component: ImprimirProformas,
    meta: { layout: Admin, requiresAuth: true },
  },

  // ERRORS
  {
    path: "/401",
    name: "401",
    component: () => import("../pages/errors/401.vue"),
    meta: { layout: Admin },
  },

  // REPORTES
  {
    path: "/admin/reportes/usuarios",
    name: "reportes.usuarios",
    component: () => import("../pages/admin/reportes/Usuarios.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  {
    path: "/admin/reportes/productos",
    name: "reportes.productos",
    component: () => import("../pages/admin/reportes/Productos.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  {
    path: "/admin/reportes/clientes",
    name: "reportes.clientes",
    component: () => import("../pages/admin/reportes/Clientes.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  {
    path: "/admin/reportes/clientes",
    name: "reportes.clientes",
    component: () => import("../pages/admin/reportes/Clientes.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  {
    path: "/admin/reportes/proveedors",
    name: "reportes.proveedors",
    component: () => import("../pages/admin/reportes/Proveedors.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  {
    path: "/admin/reportes/movimiento_inventario",
    name: "reportes.movimiento_inventario",
    component: () => import("../pages/admin/reportes/MovimientoInventario.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  {
    path: "/admin/reportes/solicitud_ingresos",
    name: "reportes.solicitud_ingresos",
    component: () => import("../pages/admin/reportes/SolicitudIngresos.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  {
    path: "/admin/reportes/orden_salidas",
    name: "reportes.orden_salidas",
    component: () => import("../pages/admin/reportes/OrdenSalidas.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  {
    path: "/admin/reportes/devolucions",
    name: "reportes.devolucions",
    component: () => import("../pages/admin/reportes/Devolucions.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  {
    path: "/admin/reportes/orden_ventas",
    name: "reportes.orden_ventas",
    component: () => import("../pages/admin/reportes/OrdenVentas.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  {
    path: "/admin/reportes/utilidad_ordens",
    name: "reportes.utilidad_ordens",
    component: () => import("../pages/admin/reportes/UtilidadOrdens.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  {
    path: "/admin/reportes/cuenta_cobrars",
    name: "reportes.cuenta_cobrars",
    component: () => import("../pages/admin/reportes/CuentaCobrars.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  {
    path: "/admin/reportes/rotacion",
    name: "reportes.rotacion",
    component: () => import("../pages/admin/reportes/Rotacion.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  {
    path: "/admin/reportes/gastos",
    name: "reportes.gastos",
    component: () => import("../pages/admin/reportes/Gastos.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  {
    path: "/admin/reportes/diario_salidas",
    name: "reportes.diario_salidas",
    component: () => import("../pages/admin/reportes/DiarioSalidas.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  {
    path: "/admin/reportes/movimientos_abastecimiento",
    name: "reportes.movimientos_abastecimiento",
    component: () =>
      import("../pages/admin/reportes/MovimientosAbastecimiento.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  {
    path: "/admin/reportes/saldos_almacen_central",
    name: "reportes.saldos_almacen_central",
    component: () => import("../pages/admin/reportes/SaldosAlmacenCentral.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
  {
    path: "/admin/reportes/diario_vehiculos",
    name: "reportes.diario_vehiculos",
    component: () => import("../pages/admin/reportes/DiarioVehiculos.vue"),
    meta: { layout: Admin, requiresAuth: true, verificaPermiso: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guard global
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const token = localStorage.getItem("token");
  // Si la ruta requiere auth
  if (to.meta.verificaPermiso) {
    if (
      authStore?.user.permisos != "*" &&
      !authStore?.user?.permisos.includes(to.name)
    ) {
      return next({ name: "401" });
    }
  }

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
