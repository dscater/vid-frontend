<script setup>
  import Content from "../../../Components/Content.vue";
  import { useProformas } from "../../../composables/proformas/useProformas";
  import { ref, onMounted, onBeforeMount } from "vue";
  import { useAppStore } from "../../../stores/aplicacion/appStore";
  import Formulario from "./Formulario.vue";
  import { useAuthStore } from "../../../stores/authStore";
  import api from "../../../composables/axios.js";
  import { useRouter } from "vue-router";
  import { useConnectivityStore } from "../../../stores/offlineStores/useConnectivityStore";
  import { useProformaStore } from "../../../stores/offlineStores/proformaStore";
  const connectivityStore = useConnectivityStore();
  const proformaStore = useProformaStore();
  const apiUrl = import.meta.env.VITE_API_URL;
  const authStore = useAuthStore();
  const props = defineProps({
    id: {
      type: String,
      default: "",
    },
  });
  const appStore = useAppStore();
  onBeforeMount(() => {
    appStore.startLoading();
  });

  const { setProforma, limpiarProforma, oProforma } = useProformas();
  const loadingProforma = ref(true);
  const cargarProforma = async () => {
    loadingProforma.value = true;
    if (connectivityStore.isOnline) {
      api.get("/admin/proformas/" + props.id).then((response) => {
        setProforma(response.data.proforma);
        loadingProforma.value = false;
        oProforma.value.proforma_productos.forEach((elem, col) => {
          obtenerStockProducto(elem.producto_id, col);
          getTotalColumna(col);
        });
      });
    } else {
      const proforma = await proformaStore.getProformaById(parseInt(props.id));
      setProforma(proforma);
      console.log(proforma);
      loadingProforma.value = false;
    }
  };

  const stockPorSucursales = ref({});
  const obtenerStockProducto = async (value, col) => {
    if (!oProforma.value.proforma_productos[col]) return;

    let total = 0;
    stockPorSucursales.value[value] = [];
    const requests = oProforma.value.sucursal_ids.map((sucursal_id) =>
      api.get("/admin/sucursal_productos/getSucursalProducto", {
        params: {
          producto_id: value,
          sucursal_id: sucursal_id,
        },
      })
    );

    const responses = await Promise.all(requests);

    responses.forEach((resp, index) => {
      const sucursal_id = oProforma.value.sucursal_ids[index];

      const stock = parseFloat(resp.data.sucursal_producto?.stock_actual ?? 0);

      const sucursalNombre =
        resp.data.sucursal_producto?.sucursal?.nombre ?? "Sin sucursal";
      stockPorSucursales.value[value].push({
        sucursal_id,
        sucursal: sucursalNombre,
        stock,
      });

      total += stock;
    });

    const response = await api.get("/admin/productos/" + value);
    if (response.data) {
      oProforma.value.proforma_productos[col].producto_id = response.data.id;
      oProforma.value.proforma_productos[col].producto = response.data;
      oProforma.value.proforma_productos[col].precio = response.data.precio;
      oProforma.value.proforma_productos[col].unidad_medida_id =
        response.data.unidad_medida_id;
      oProforma.value.proforma_productos[col].stock_actual = total;
      oProforma.value.proforma_productos[col].stock_actual_aux = total;

      oProforma.value.proforma_detalles.forEach((_, fila) => {
        sumaTotalPorFila(fila);
      });
    }
  };

  const sumaTotalPorFila = (fila) => {
    let total = 0;
    let total_cantidad = 0;
    oProforma.value.proforma_detalles[fila].proforma_detalle_productos.forEach(
      (elem_detalle, index_col) => {
        if (elem_detalle.cantidad) {
          oProforma.value.proforma_detalles[fila].proforma_detalle_productos[
            index_col
          ].precio = parseFloat(
            oProforma.value.proforma_productos[index_col].precio
          );
          total +=
            parseFloat(elem_detalle.cantidad) *
            parseFloat(oProforma.value.proforma_productos[index_col].precio);
          total_cantidad += parseFloat(elem_detalle.cantidad);
          oProforma.value.proforma_detalles[fila].proforma_detalle_productos[
            index_col
          ].subtotal =
            parseFloat(elem_detalle.cantidad) *
            parseFloat(oProforma.value.proforma_productos[index_col].precio);
        }
      }
    );
    oProforma.value.proforma_detalles[fila].total = total == 0 ? "" : total;
    oProforma.value.proforma_detalles[fila].saldo = total == 0 ? "" : total;
    oProforma.value.proforma_detalles[fila].cantidad =
      total_cantidad == 0 ? "" : total_cantidad;
  };

  const getTotalColumna = async (index_col) => {
    oProforma.value.proforma_productos[index_col].stock_actual =
      oProforma.value.proforma_productos[index_col].stock_actual_aux;
    let total = 0;

    oProforma.value.proforma_detalles.forEach((element) => {
      const cantidad = element.proforma_detalle_productos[index_col].cantidad;
      const resta = element.proforma_detalle_productos[index_col].resta;
      if (resta) {
        // existente
        if (cantidad) {
          // total += parseFloat(cantidad) - parseFloat(resta);
          total += parseFloat(cantidad);
        } else {
          total -= parseFloat(resta);
        }
      } else if (cantidad) {
        total += parseFloat(cantidad ?? 0);
      }
    });

    const total_sucursal =
      oProforma.value.proforma_productos[index_col].stock_actual;
    const nombre_producto =
      oProforma.value.proforma_productos[index_col].producto.nombre;

    oProforma.value.proforma_productos[index_col].stock_actual =
      parseFloat(total_sucursal) - parseFloat(total);

    oProforma.value.proforma_productos[index_col].agregados = total;
    oProforma.value.proforma_productos[index_col].suma = total_sucursal;
    return total;
  };

  onMounted(() => {
    cargarProforma();
    appStore.stopLoading();
  });
</script>
<template>
  <Content>
    <template #header>
      <div class="row mb-2">
        <div class="col-sm-6">
          <h1 class="m-0">Proformas > <small>Detalles</small></h1>
        </div>
        <!-- /.col -->
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-right">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'Inicio' }">Inicio</router-link>
            </li>
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'proformas.index' }"
                >Proformas</router-link
              >
            </li>
            <li class="breadcrumb-item active">Detalles</li>
          </ol>
        </div>
        <!-- /.col -->
      </div>
      <!-- /.row -->
    </template>
    <div class="row">
      <div class="col-md-12">
        <div class="row">
          <div class="col-md-4">
            <router-link
              class="btn btn-default"
              :to="{ name: 'proformas.index' }"
            >
              <i class="fa fa-arrow-left"></i> Volver
            </router-link>
          </div>
          <div class="col-md-8 my-1"></div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <div class="card">
              <div class="card-body">
                <div class="row">
                  <div class="col-12" v-if="oProforma.id != 0">
                    <h4>{{ oProforma.codigo }}</h4>
                  </div>
                  <div
                    class="col-md-4 mb-0"
                    v-if="!authStore?.user.sucursal_asignada"
                  >
                    <label>Sucursal(es)</label>
                    {{ oProforma.sucursals_txt }}
                  </div>
                  <div class="col-md-4 mb-0" v-else>
                    <b>Sucursal: </b
                    >{{ authStore?.user.sucursal_asignada.nombre }}
                  </div>
                  <div class="col-md-4 mb-0">
                    <label>Fecha</label>
                    {{ oProforma.fecha }}
                  </div>
                  <div class="col-md-4 mb-0">
                    <label>Hora</label>
                    {{ oProforma.hora }}
                  </div>
                  <div
                    class="col-12 mt-2 overflow-auto"
                    v-if="oProforma.sucursal_ids.length > 0"
                  >
                    <table class="table table-bordered">
                      <thead>
                        <tr class="bg8">
                          <th style="min-width: 180px">PRECIO</th>
                          <th></th>
                          <th></th>
                          <th
                            v-for="item in oProforma.proforma_productos"
                            style="min-width: 180px"
                            class="text-center"
                          >
                            {{ item.precio }}
                          </th>
                        </tr>
                        <tr class="bg6">
                          <th></th>
                          <th>Nro. Recibo</th>
                          <th>Total</th>
                          <th
                            v-for="(
                              item, index_col
                            ) in oProforma.proforma_productos"
                            class="p-0 text-center"
                          >
                            {{ item.producto.nombre }} <br />
                            {{ item.producto.unidad_medida?.nombre }}
                          </th>
                        </tr>

                        <tr class="bg9">
                          <th>STOCK POR SUCURSAL</th>
                          <th></th>
                          <th></th>
                          <th
                            v-for="item in oProforma.proforma_productos"
                            :class="{
                              'bg-danger': item.stock_actual < 0,
                            }"
                          >
                            <div
                              v-for="item_p_s in stockPorSucursales[
                                item.producto_id
                              ]"
                            >
                              <span class="text-muted"
                                >{{ item_p_s.sucursal }}:</span
                              >
                              {{ item_p_s.stock }}
                            </div>
                          </th>
                        </tr>
                        <!-- <tr class="bg9">
                          <th>
                            STOCK ACTUAL
                            <small class="text-muted">(DISPONIBLE)</small>
                          </th>
                          <th></th>
                          <th></th>
                          <th
                            v-for="item in oProforma.proforma_productos"
                            :class="{
                              'bg-danger': item.stock_actual < 0,
                            }"
                          >
                            {{ item.stock_actual }}
                          </th>
                        </tr> -->
                        <tr class="bg7">
                          <th>PRODUCTOS AÑADIDOS</th>
                          <th></th>
                          <th></th>
                          <th
                            v-for="item in oProforma.proforma_productos"
                            :class="{
                              'bg-danger': item.stock_actual < 0,
                            }"
                          >
                            {{ item.agregados }}
                          </th>
                        </tr>
                        <!-- <tr class="bg10">
                          <th>SUMA TOTAL</th>
                          <th></th>
                          <th></th>
                          <th
                            v-for="item in oProforma.proforma_productos"
                            :class="{
                              'bg-danger': item.stock_actual < 0,
                            }"
                          >
                            {{ item.suma }}
                          </th>
                        </tr> -->
                      </thead>
                      <tbody>
                        <template v-if="oProforma.proforma_detalles.length > 0">
                          <tr
                            v-for="(item, index) in oProforma.proforma_detalles"
                          >
                            <td class="p-0 pl-2">
                              {{ item.cliente.razon_social }}
                            </td>
                            <td class="bg6 font-weight-bold text-center">
                              <small v-if="!item.id" class="text-muted"
                                >(automatico)</small
                              >
                              <span v-else v-text="item.id"></span>
                            </td>
                            <td class="bg6 font-weight-bold text-center">
                              {{ item.total }}
                            </td>
                            <td
                              v-for="(
                                item_detalle, col_index
                              ) in item.proforma_detalle_productos"
                              class="p-0 text-center"
                              :class="{
                                bg9: item_detalle.verificado == 1,
                              }"
                            >
                              {{ item_detalle.cantidad }}
                            </td>
                          </tr>
                        </template>
                        <template v-else>
                          <tr>
                            <td
                              :colspan="oProforma.proforma_productos.length + 5"
                              class="text-center font-weight-bold text-muted"
                            >
                              NO SE AGREGÓ NINGÚN CLIENTE
                            </td>
                          </tr>
                        </template>
                      </tbody>
                    </table>
                  </div>
                  <div
                    class="col-12 border p-2 mt-2 text-center text-muted font-weight-bold"
                    v-else
                  >
                    DEBES SELECCIONAR UNA SUCURSAL
                  </div>
                </div>
                <div class="row" v-if="oProforma.errors?.proforma_productos">
                  <div class="col-12">
                    <ul class="d-block text-danger mb-0 list-unstyled">
                      <li class="parsley-required">
                        {{ oProforma.errors?.proforma_productos[0] }}
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="row" v-if="oProforma.errors?.proforma_detalles">
                  <div class="col-12">
                    <ul class="d-block text-danger mb-0 list-unstyled">
                      <li class="parsley-required">
                        {{ oProforma.errors?.proforma_detalles[0] }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Content>
</template>
