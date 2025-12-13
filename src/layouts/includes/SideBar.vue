<script setup>
  import { onMounted, onUnmounted, ref, nextTick, watch, computed } from "vue";
  // import { router } from "@inertiajs/vue3";
  import ItemMenu from "../../components/ItemMenu.vue";
  import { useSideBar } from "../../composables/useSidebar.js";
  import { useAppStore } from "../../stores/aplicacion/appStore.js";
  import { useConfiguracionStore } from "../../stores/configuracion/configuracionStore";
  import { verificaImagen } from "../../composables/useLoadings/verificaImagen";
  import { useAuthStore } from "../../stores/authStore";
  import { useRoute, useRouter } from "vue-router";
  import { useConnectivityStore } from "../../stores/offlineStores/useConnectivityStore";
  const connectivityStore = useConnectivityStore();
  const router = useRouter();
  const authStore = useAuthStore();

  const { closeSidebar, toggleSubMenuELem } = useSideBar();
  const configuracionStore = useConfiguracionStore();
  const appStore = useAppStore();
  const usuario = ref(null);
  const toggleSubMenu = (e) => {
    e.stopPropagation();
    const elem = e.currentTarget;
    if (
      elem.classList.contains("menu-is-opening") &&
      elem.classList.contains("menu-open")
    ) {
      elem.classList.remove("menu-is-opening");
      elem.classList.remove("menu-open");
      toggleSubMenuELem(elem, false);
    } else {
      elem.classList.add("menu-is-opening");
      elem.classList.add("menu-open");
      toggleSubMenuELem(elem, true);
    }
  };

  const logout = () => {
    authStore.logout();
    // router.push({ name: "Login" });
  };

  const route = useRoute();
  const routeCurrent = computed(() => route.name);

  onMounted(() => {
    configuracionStore.initConfiguracion();
    usuario.value = appStore.getUsuario;
    // Selecciona el elemento del widget
    var sidebarSearchElement = $('[data-widget="sidebar-search"]');
    // Configura manualmente el texto de "no encontrado"
    sidebarSearchElement.data("notFoundText", "Sin resultados");
  });

  const loadingLogo = ref(true);

  watch(
    () => configuracionStore.oConfiguracion.url_logo,
    async (newUrl) => {
      if (!newUrl) return;
      try {
        const resp = await verificaImagen(newUrl);
        loadingLogo.value = !resp;
      } catch (e) {
        loadingLogo.value = true;
      }
    },
    { immediate: true } // también dispara la primera vez si ya tiene valor
  );

  onUnmounted(() => {});
</script>
<template>
  <!-- Main Sidebar Container -->
  <aside class="main-sidebar sidebar-dark-primary bg2 elevation-4">
    <!-- Brand Logo -->
    <a href="/" class="brand-link bg1">
      <el-skeleton class="brand-image" animated :loading="loadingLogo">
        <template #template>
          <el-skeleton-item
            variant="circle"
            class="brand-image img-circle elevation-3"
            style="width: 40px"
          />
        </template>
        <template #default>
          <img
            :src="configuracionStore.oConfiguracion.url_logo"
            alt="Logo"
            class="brand-image img-circle elevation-3"
            loading="lazy"
            v-if="!loadingLogo"
          />
        </template>
      </el-skeleton>

      <span class="brand-text font-weight-light title_Chau_Philomene_One">{{
        configuracionStore.oConfiguracion.nombre_sistema
      }}</span>
    </a>

    <!-- Sidebar -->
    <div class="sidebar p-0">
      <!-- Sidebar user panel (optional) -->
      <div class="user-panel mt-3 pb-3 mb-3 d-flex">
        <div class="image">
          <img
            :src="authStore?.user?.url_foto"
            class="img-circle elevation-2"
            alt="User Image"
            v-if="!loadingLogo"
          />
        </div>
        <div class="info">
          <router-link
            :to="{
              name: 'profile.edit',
              params: { id: authStore?.user?.id ?? 0 },
            }"
            class="d-block"
            >{{ authStore?.user?.full_name }}</router-link
          >
        </div>
      </div>

      <!-- Sidebar Menu -->
      <nav class="mt-2">
        <ul
          class="nav nav-pills nav-sidebar flex-column"
          data-widget="treeview"
          role="menu"
          data-accordion="false"
        >
          <ItemMenu
            :label="'Inicio'"
            :ruta="'Inicio'"
            :icon="'fa fa-home'"
            :class="[routeCurrent == 'Inicio' ? 'active' : '']"
          ></ItemMenu>
          <li class="nav-header font-weight-bold bg3">OPERACIONES</li>
          <ItemMenu
            v-if="
              authStore?.user?.permisos == '*' ||
              authStore?.user?.permisos.includes('orden_ventas.index')
            "
            :class="[
              routeCurrent == 'orden_ventas.create' ||
              routeCurrent == 'orden_ventas.edit' ||
              routeCurrent == 'orden_ventas.imprimir'
                ? 'active'
                : '',
            ]"
            :label="'Orden de Ventas'"
            :ruta="'orden_ventas.index'"
            :icon="'fa fa-clipboard-check'"
          ></ItemMenu>
          <ItemMenu
            v-if="
              authStore?.user?.permisos == '*' ||
              authStore?.user?.permisos.includes('proformas.index')
            "
            :class="[
              routeCurrent == 'proformas.create' ||
              routeCurrent == 'proformas.edit' ||
              routeCurrent == 'proformas.imprimir'
                ? 'active'
                : '',
            ]"
            :label="'Proformas'"
            :ruta="'proformas.index'"
            :icon="'fa fa-list'"
          ></ItemMenu>
          <ItemMenu
            v-if="
              authStore?.user?.permisos == '*' ||
              authStore?.user?.permisos.includes('cuenta_cobrars.index')
            "
            :label="'Cuentas por Cobrar'"
            :ruta="'cuenta_cobrars.index'"
            :icon="'fa fa-list-alt'"
          ></ItemMenu>
          <li
            class="nav-item"
            v-if="
              authStore?.user?.permisos == '*' ||
              authStore?.user?.permisos.includes('devolucion_stocks.index') ||
              authStore?.user?.permisos.includes('devolucion_clientes.index')
            "
          >
            <a
              href="#"
              class="nav-link sub-menu"
              :class="[
                routeCurrent == 'devolucion_stocks.index' ||
                routeCurrent == 'devolucion_clientes.index'
                  ? 'active menu-is-opening menu-open'
                  : '',
              ]"
              @click.stop="toggleSubMenu($event)"
            >
              <i class="nav-icon fa fa-sign-out-alt"></i>
              <p>
                Devoluciones
                <i class="fas fa-angle-left right"></i>
              </p>
            </a>
            <ul class="nav nav-treeview">
              <ItemMenu
                v-if="
                  connectivityStore.isOnline &&
                  (authStore?.user?.permisos == '*' ||
                    authStore?.user?.permisos.includes(
                      'devolucion_stocks.index'
                    ))
                "
                :label="'Devolución de Stock'"
                :ruta="'devolucion_stocks.index'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes(
                    'devolucion_clientes.index'
                  )
                "
                :label="'Devolución de Clientes'"
                :ruta="'devolucion_clientes.index'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
            </ul>
          </li>
          <li
            class="nav-item"
            v-if="
              connectivityStore.isOnline &&
              (authStore?.user?.permisos == '*' ||
                authStore?.user?.permisos.includes(
                  'solicitud_ingresos.index'
                ) ||
                authStore?.user?.permisos.includes('orden_salidas.index') ||
                authStore?.user?.permisos.includes('transferencias.index'))
            "
          >
            <a
              href="#"
              class="nav-link sub-menu"
              :class="[
                routeCurrent == 'solicitud_ingresos.index' ||
                routeCurrent == 'orden_salidas.index' ||
                routeCurrent == 'transferencias.index'
                  ? 'active menu-is-opening menu-open'
                  : '',
              ]"
              @click.stop="toggleSubMenu($event)"
            >
              <i class="nav-icon fa fa-sync"></i>
              <p>
                Movimientos
                <i class="fas fa-angle-left right"></i>
              </p>
            </a>
            <ul class="nav nav-treeview">
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes('solicitud_ingresos.index')
                "
                :label="'Solicitud de Ingreso'"
                :ruta="'solicitud_ingresos.index'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes('orden_salidas.index')
                "
                :label="'Orden de Salida'"
                :ruta="'orden_salidas.index'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes('transferencias.index')
                "
                :label="'Transferencias de Stock'"
                :ruta="'transferencias.index'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
            </ul>
          </li>
          <ItemMenu
            v-if="
              connectivityStore.isOnline &&
              (authStore?.user?.permisos == '*' ||
                authStore?.user?.permisos.includes('gastos.index'))
            "
            :label="'Registro de Gastos'"
            :ruta="'gastos.index'"
            :icon="'fa fa-clipboard-list'"
          ></ItemMenu>
          <li class="nav-header font-weight-bold bg3">ADMINISTRACIÓN</li>
          <ItemMenu
            v-if="
              authStore?.user?.permisos == '*' ||
              authStore?.user?.permisos.includes('clientes.index')
            "
            :label="'Clientes'"
            :ruta="'clientes.index'"
            :icon="'fa fa-user-friends'"
          ></ItemMenu>
          <ItemMenu
            v-if="
              connectivityStore.isOnline &&
              (authStore?.user?.permisos == '*' ||
                authStore?.user?.permisos.includes('proveedors.index'))
            "
            :label="'Proveedores'"
            :ruta="'proveedors.index'"
            :icon="'fa fa-clipboard-list'"
          ></ItemMenu>
          <li
            class="nav-item"
            v-if="
              connectivityStore.isOnline &&
              (authStore?.user?.permisos == '*' ||
                authStore?.user?.permisos.includes('productos.index') ||
                authStore?.user?.permisos.includes('unidad_medidas.index') ||
                authStore?.user?.permisos.includes('marcas.index') ||
                authStore?.user?.permisos.includes('sub_categorias.index') ||
                authStore?.user?.permisos.includes('categorias.index'))
            "
          >
            <a
              href="#"
              class="nav-link sub-menu"
              :class="[
                routeCurrent == 'productos.index' ||
                routeCurrent == 'unidad_medidas.index' ||
                routeCurrent == 'marcas.index' ||
                routeCurrent == 'sub_categorias.index' ||
                routeCurrent == 'categorias.index'
                  ? 'active menu-is-opening menu-open'
                  : '',
              ]"
              @click.stop="toggleSubMenu($event)"
            >
              <i class="nav-icon fas fa-box"></i>
              <p>
                Productos
                <i class="fas fa-angle-left right"></i>
              </p>
            </a>
            <ul class="nav nav-treeview">
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes('productos.index')
                "
                :label="'Listado Productos'"
                :ruta="'productos.index'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes('unidad_medidas.index')
                "
                :label="'Unidades de Medida'"
                :ruta="'unidad_medidas.index'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes('marcas.index')
                "
                :label="'Marcas'"
                :ruta="'marcas.index'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes('sub_categorias.index')
                "
                :label="'Subcategorías'"
                :ruta="'sub_categorias.index'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes('categorias.index')
                "
                :label="'Categorías'"
                :ruta="'categorias.index'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
            </ul>
          </li>
          <li
            class="nav-item"
            v-if="
              connectivityStore.isOnline &&
              (authStore?.user?.permisos == '*' ||
                authStore?.user?.permisos.includes('sucursals.index') ||
                authStore?.user?.permisos.includes('sucursal_productos.index'))
            "
          >
            <a
              href="#"
              class="nav-link sub-menu"
              :class="[
                routeCurrent == 'sucursals.index' ||
                routeCurrent == 'sucursal_productos.index'
                  ? 'active menu-is-opening menu-open'
                  : '',
              ]"
              @click.stop="toggleSubMenu($event)"
            >
              <i class="nav-icon fas fa-building"></i>
              <p>
                Sucursales
                <i class="fas fa-angle-left right"></i>
              </p>
            </a>
            <ul class="nav nav-treeview">
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes('sucursals.index')
                "
                :label="'Sucursales'"
                :ruta="'sucursals.index'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes('sucursal_productos.index')
                "
                :label="'Productos Sucursal'"
                :ruta="'sucursal_productos.index'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
            </ul>
          </li>
          <li
            class="nav-item"
            v-if="
              connectivityStore.isOnline &&
              (authStore?.user?.permisos == '*' ||
                authStore?.user?.permisos.includes('usuarios.index') ||
                authStore?.user?.permisos.includes('roles.index'))
            "
          >
            <a
              href="#"
              class="nav-link sub-menu"
              :class="[
                routeCurrent == 'usuarios.index' ||
                routeCurrent == 'roles.index' ||
                routeCurrent == 'roles.edit'
                  ? 'active menu-is-opening menu-open'
                  : '',
              ]"
              @click.stop="toggleSubMenu($event)"
            >
              <i class="nav-icon fas fa-users"></i>
              <p>
                Usuarios
                <i class="fas fa-angle-left right"></i>
              </p>
            </a>
            <ul class="nav nav-treeview">
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes('usuarios.index')
                "
                :label="'Usuarios'"
                :ruta="'usuarios.index'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes('roles.index')
                "
                :class="[routeCurrent == 'roles.edit' ? 'active' : '']"
                :label="'Roles'"
                :ruta="'roles.index'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
            </ul>
          </li>
          <li
            class="nav-header font-weight-bold bg3"
            v-if="
              authStore?.user?.permisos == '*' ||
              authStore?.user?.permisos.includes('reportes.usuarios') ||
              authStore?.user?.permisos.includes('reportes.productos') ||
              authStore?.user?.permisos.includes('reportes.sucursals')
            "
          >
            REPORTES
          </li>
          <li
            class="nav-item"
            v-if="
              connectivityStore.isOnline &&
              (authStore?.user?.permisos == '*' ||
                authStore?.user?.permisos.includes('reportes.usuarios') ||
                authStore?.user?.permisos.includes('reportes.productos') ||
                authStore?.user?.permisos.includes('reportes.sucursals'))
            "
          >
            <a
              href="#"
              class="nav-link sub-menu"
              :class="[
                routeCurrent == 'reportes.usuarios' ||
                routeCurrent == 'reportes.productos'
                  ? 'active menu-is-opening menu-open'
                  : '',
              ]"
              @click.stop="toggleSubMenu($event)"
            >
              <i class="nav-icon fas fa-file-alt"></i>
              <p>
                Reportes
                <i class="fas fa-angle-left right"></i>
              </p>
            </a>
            <ul class="nav nav-treeview">
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes('reportes.usuarios')
                "
                :label="'Usuarios'"
                :ruta="'reportes.usuarios'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes('reportes.productos')
                "
                :label="'Productos'"
                :ruta="'reportes.productos'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes('reportes.clientes')
                "
                :label="'Lista de Clientes'"
                :ruta="'reportes.clientes'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes('reportes.proveedors')
                "
                :label="'Lista de Proveedores'"
                :ruta="'reportes.proveedors'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes(
                    'reportes.movimiento_inventario'
                  )
                "
                :label="'Movimientos de Inventario'"
                :ruta="'reportes.movimiento_inventario'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes(
                    'reportes.solicitud_ingresos'
                  )
                "
                :label="'Solicitudes de Ingreso'"
                :ruta="'reportes.solicitud_ingresos'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes('reportes.orden_salidas')
                "
                :label="'Órdenes de Salida'"
                :ruta="'reportes.orden_salidas'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes('reportes.devolucions')
                "
                :label="'Devoluciones'"
                :ruta="'reportes.devolucions'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes('reportes.orden_ventas')
                "
                :label="'Órdenes de Ventas'"
                :ruta="'reportes.orden_ventas'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes('reportes.utilidad_ordens')
                "
                :label="'Utilidad de Ordenes de Ventas'"
                :ruta="'reportes.utilidad_ordens'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes('reportes.cuenta_cobrars')
                "
                :label="'Cuentas por Cobrar'"
                :ruta="'reportes.cuenta_cobrars'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes('reportes.rotacion')
                "
                :label="'Rotación de Inventario'"
                :ruta="'reportes.rotacion'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes('reportes.gastos')
                "
                :label="'Gastos'"
                :ruta="'reportes.gastos'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes('reportes.diario_salidas')
                "
                :label="'Diario de Salidas por Sucursal'"
                :ruta="'reportes.diario_salidas'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes(
                    'reportes.movimientos_abastecimiento'
                  )
                "
                :label="'Semanal de Movimientos y Abastecimiento'"
                :ruta="'reportes.movimientos_abastecimiento'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes(
                    'reportes.saldos_almacen_central'
                  )
                "
                :label="'Saldos del Almacén Central'"
                :ruta="'reportes.saldos_almacen_central'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
              <ItemMenu
                v-if="
                  authStore?.user?.permisos == '*' ||
                  authStore?.user?.permisos.includes(
                    'reportes.diario_vehiculos'
                  )
                "
                :label="'Control Diario de Sucursales'"
                :ruta="'reportes.diario_vehiculos'"
                :icon="'fa fa-angle-right'"
              ></ItemMenu>
            </ul>
          </li>
          <li class="nav-header font-weight-bold bg3">OTROS</li>
          <ItemMenu
            v-if="
              connectivityStore.isOnline &&
              (authStore?.user?.permisos == '*' ||
                authStore?.user?.permisos.includes('notificacions.index'))
            "
            :class="[
              routeCurrent == 'notifiacions.index' ||
              routeCurrent == 'notificacions.show'
                ? 'active menu-is-opening menu-open'
                : '',
            ]"
            :label="'Notificaciones'"
            :ruta="'notificacions.index'"
            :icon="'fa fa-bell'"
          ></ItemMenu>
          <ItemMenu
            v-if="
              connectivityStore.isOnline &&
              (authStore?.user?.permisos == '*' ||
                authStore?.user?.permisos.includes('configuracions.index'))
            "
            :label="'Configuración Sistema'"
            :ruta="'configuracions.index'"
            :icon="'fa fa-cog'"
          ></ItemMenu>
          <ItemMenu
            v-if="connectivityStore.isOnline"
            :label="'Perfil'"
            :ruta="'profile.edit'"
            :params="{ id: authStore?.user?.id ?? 0 }"
            :icon="'fa fa-user'"
          ></ItemMenu>
          <li class="nav-item">
            <a href="#" class="nav-link" @click.prevent="logout()">
              <i class="nav-icon fa fa-power-off"></i>
              <p>Salir</p>
            </a>
          </li>
        </ul>
      </nav>
      <!-- /.sidebar-menu -->
    </div>
    <!-- /.sidebar -->
  </aside>
</template>
<style scoped></style>
