<script setup>
  import { onMounted, reactive, ref } from "vue";
  import { useAppStore } from "../../stores/aplicacion/appStore";
  import { useAuthStore } from "../../stores/authStore";
  import api from "../../composables/axios";
  const appStore = useAppStore();
  const authStore = useAuthStore();
  const array_infos = ref([]);
  const loadingInfos = ref(false);
  const cargarArrayInfos = () => {
    loadingInfos.value = true;
    api
      .get("/admin/inicio")
      .then((response) => {
        array_infos.value = response.data.array_infos;
      })
      .catch((err) => {})
      .finally(() => {
        loadingInfos.value = false;
      });
  };

  const listProductos = ref([]);

  const listSucursals = ref([]);

  const cargarProductos = () => {
    api.get("/admin/productos/listado").then((response) => {
      listProductos.value = response.data.productos;
    });
  };

  const cargarSucursals = () => {
    api.get("/admin/sucursals/listadoSP").then((response) => {
      listSucursals.value = response.data.sucursals;
      cargarStocks();
    });
  };

  const cargarListas = () => {
    cargarProductos();
    cargarSucursals();
  };

  const stockVacio = ref(true);
  const stocks = reactive({});

  const cargarStocks = async () => {
    for (const producto of listProductos.value) {
      if (!stocks[producto.id]) {
        stocks[producto.id] = {};
      }

      await Promise.all(
        listSucursals.value.map(async (sucursal) => {
          const resp = await api.get(
            "/admin/sucursal_productos/getSucursalProducto",
            {
              params: {
                producto_id: producto.id,
                sucursal_id: sucursal.id,
              },
            }
          );

          stocks[producto.id][sucursal.id] =
            resp.data.sucursal_producto?.stock_actual ?? 0;
        })
      );
    }
  };

  const totalPorProducto = (producto_id) => {
    const sucursales = stocks[producto_id];

    if (!sucursales) return 0;

    let resultado = Object.values(sucursales).reduce(
      (total, stock) => total + Number(stock),
      0
    );

    if (resultado <= 0 && stockVacio.value) {
      resultado = -1;
    }

    return resultado;
  };

  onMounted(() => {
    cargarListas();
    cargarArrayInfos();
    appStore.stopLoading();
  });
</script>
<template>
  <Content>
    <template #header>
      <div class="row mb-2">
        <div class="col-sm-6">
          <h1 class="m-0">Inicio</h1>
        </div>
        <!-- /.col -->
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-right">
            <li class="breadcrumb-item active">Inicio</li>
          </ol>
        </div>
        <!-- /.col -->
      </div>
      <!-- /.row -->
    </template>
    <el-skeleton :loading="loadingInfos" animated class="w-100 row" :count="4">
      <template #template>
        <div class="col-lg-3 col-6">
          <el-skeleton-item style="height: 120px"></el-skeleton-item>
        </div>
      </template>
      <template #default>
        <div class="row">
          <div class="col-lg-3 col-6" v-for="item in array_infos">
            <!-- small box -->
            <div class="small-box" :class="[item.color]">
              <div class="inner">
                <h3 class="text-white">{{ item.cantidad }}</h3>

                <p>{{ item.label }}</p>
              </div>
              <div class="icon">
                <i class="fa" :class="[item.icon]"></i>
              </div>
              <router-link :to="{ name: item.url }" class="small-box-footer"
                >Ver más <i class="fa fa-arrow-alt-circle-right"></i
              ></router-link>
            </div>
          </div>
        </div>
      </template>
    </el-skeleton>

    <div class="row">
      <div class="col-12 bg-white">
        <el-switch
          v-model="stockVacio"
          size="large"
          active-text="Con Stock"
          inactive-text="Sin Stock"
        />

        <button
          class="ml-2 btn btn-sm btn-primary text-xs"
          @click="cargarStocks"
        >
          Actualizar <i class="fa fa-sync"> </i>
        </button>
        <table class="table table-bordered bg-white table-hover">
          <thead>
            <tr>
              <th>N°</th>
              <th>PRODUCTO</th>
              <th>CÓDIGO</th>
              <th>UNIDAD</th>
              <th v-for="item in listSucursals">
                {{ item.nombre }}
              </th>
              <th>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <template
              v-for="(item_prod, index_prod) in listProductos"
              :key="item_prod.id"
            >
              <tr v-if="totalPorProducto(item_prod.id) > -1">
                <td>{{ index_prod + 1 }}</td>
                <td>{{ item_prod.nombre }}</td>
                <td>{{ item_prod.codigo }}</td>
                <td>{{ item_prod.unidad_medida.nombre }}</td>
                <td v-for="item in listSucursals">
                  {{ stocks[item_prod.id]?.[item.id] ?? "..." }}
                </td>
                <td class="font-weight-bold text-sm bg6">
                  {{ totalPorProducto(item_prod.id) }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </Content>
</template>
