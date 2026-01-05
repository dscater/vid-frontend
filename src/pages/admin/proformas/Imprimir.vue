<script setup>
  import Content from "../../../Components/Content.vue";
  import { useProformas } from "../../../composables/proformas/useProformas";
  import { ref, onMounted, onBeforeMount } from "vue";
  import { useAppStore } from "../../../stores/aplicacion/appStore";
  import { useAuthStore } from "../../../stores/authStore";
  import api from "../../../composables/axios.js";
  import { useRouter } from "vue-router";
  import { useConfiguracionStore } from "../../../stores/configuracion/configuracionStore";
  import html2pdf from "html2pdf.js";
  import { useConnectivityStore } from "../../../stores/offlineStores/useConnectivityStore";
  import { useProformaStore } from "../../../stores/offlineStores/proformaStore.js";
  import { isEmpty } from "element-plus/es/utils/types.mjs";
  const connectivityStore = useConnectivityStore();
  const proformaStore = useProformaStore();
  const configuracionStore = useConfiguracionStore();
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
  const proformaDetallesAux = ref([]);
  const cargarProforma = async () => {
    loadingProforma.value = true;
    if (!connectivityStore.isOnline) {
      const data = await proformaStore.getProformaById(parseInt(props.id));
      setProforma(data, true);
      loadingProforma.value = false;
    } else {
      api.get("/admin/proformas/" + props.id).then((response) => {
        setProforma(response.data.proforma, true);
        loadingProforma.value = false;
        proformaDetallesAux.value = oProforma.value.proforma_detalles;
        listClientes.value = oProforma.value.proforma_detalles.map((item) => ({
          value: item.cliente.id,
          // label: `${item.razon_social} - ${item.ci}`,
          label: `${item.cliente.razon_social}`,
        }));
      });
    }
  };

  const sucursal_id = ref("");
  const listSucursals = ref([]);
  const cargarSucursals = async () => {
    if (connectivityStore.isOnline) {
      api.get("/admin/sucursals/listadoSP").then((response) => {
        listSucursals.value = response.data.sucursals;
        console.log(listSucursals.value);
        console.log(oProforma.value.sucursal_ids);
        listSucursals.value = listSucursals.value.filter((s) =>
          oProforma.value.sucursal_ids.includes(s.id)
        );
        console.log(listSucursals.value);
      });
    } else {
      listSucursals.value = await sucursalStore.getAllSinAlmacen();
    }
  };
  const cliente_id = ref([]);
  const listClientes = ref([]);
  const listClientesAux = ref([]);
  const loadingClientes = ref(false);
  const intervalClientes = ref(null);
  const onInputSelectClientes = (event) => {
    let query = "";
    if (typeof event === "string") {
      query = event;
    } else if (event?.target?.value) {
      query = event.target.value;
    }

    if (query.length >= 1) {
      clearInterval(intervalClientes.value);
      intervalClientes.value = setTimeout(() => {
        remoteMethodClientes(query);
      }, 400);
    }
  };
  const remoteMethodClientes = async (query) => {
    if (!query || query.length < 1) {
      return;
    }
    loadingClientes.value = true;
    try {
      let response = null;
      if (connectivityStore.isOnline) {
        response = await api.get(
          "/admin/clientes/listadoSelectElementUi" +
            `?search=${encodeURIComponent(query)}`
        );
      } else {
        response = { data: { clientes: [] } };
        response.data.clientes = await clienteStore.getAll();
      }
      const data = response ? response.data.clientes : [];
      // Suponiendo que data es un array de clientes [{id, nombre}]
      listClientes.value = data.map((cliente) => ({
        value: cliente.id,
        // label: `${cliente.razon_social} - ${cliente.ci}`,
        label: `${cliente.razon_social}`,
      }));
      listClientesAux.value = { ...listClientes.value };
    } catch (error) {
      console.log(error);
      listClientes.value = [];
    } finally {
      loadingClientes.value = false;
    }
  };

  const filtraListado = () => {
    if (!isEmpty(cliente_id.value)) {
      proformaDetallesAux.value = oProforma.value.proforma_detalles.filter(
        (s) => cliente_id.value.includes(s.cliente_id)
      );
    } else {
      proformaDetallesAux.value = oProforma.value.proforma_detalles;
      // console.log("todos");
    }
  };

  function formatDMY(fecha) {
    const d = new Date(fecha);
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const anio = d.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }
  onMounted(() => {
    cargarSucursals();
    cargarProforma();
    appStore.stopLoading();
  });

  async function imprimirContenedor() {
    const elemento = document.getElementById("principal");

    const opt = {
      margin: 0,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "cm", format: "letter", orientation: "portrait" },
    };

    // Generar el PDF como blob
    let fontSize = ``;
    let minWidth = `21.59cm`;
    if (!connectivityStore.isOnline) {
      fontSize = `font-size:0.7em;`;
      minWidth = `20cm`;
    }
    const html = `
      <html>
        <head>
          <style>
      .contenedor_factura {
        page-break-after: always;
        width: ${minWidth};
        overflow: auto;
        max-width: 21.59cm;
        margin: auto;
          ${fontSize}
      }

      .contenedor_factura table {
        border-collapse: collapse;
      }

      .contenedor_factura {
        padding: 10px;
        width: ${minWidth};
        font-family: Arial, Helvetica, sans-serif;
      }

      .contenedor_factura .centreado {
        text-align: center;
      }

      .contenedor_factura .derecha {
        text-align: right;
      }

      .contenedor_factura .header {
        width: 100%;
        display: flex;
      }
      .contenedor_factura .header .logo {
        text-align: center;
        width: 150px;
        flex: 1;
      }
      .contenedor_factura .tipo {
        width: 100%;
        font-weight: bold;
        text-align: right;
      }

      .contenedor_factura .check {
        display: inline-block;
        height: 20px;
        width: 20px;
        text-align: center;
        font-size: 1em;
        border: solid 2px;
      }

      .contenedor_factura .check.active {
        background-color: rgb(230, 230, 230);
      }

      .contenedor_factura .header .logo img {
        height: 90px;
      }

      .contenedor_factura .header .dir {
        text-align: center;
        flex: 1;
      }

      .contenedor_factura .header .total {
        text-align: right;
        flex: 1;
        font-weight: bold;
      }

      .contenedor_factura .header .total .monto {
        border: solid 2px;
        padding: 7px;
      }

      .contenedor_factura .header .total .nro {
        font-weight: bold;
        display: block;
        margin-top: 20px;
      }

      .contenedor_factura .info {
        margin-top: 10px;
        margin-bottom: 10px;
      }

      .contenedor_factura .contenido {
        width: 100%;
      }
      .contenedor_factura .contenido table {
        width: 100%;
      }

      .contenedor_factura .info_pagos table tr td:nth-child(odd) {
        text-align: right;
      }

      .contenedor_factura .tbold {
        font-size: 1.02em;
        font-weight: bold;
      }
      .contenedor_factura .final {
        text-align: center;
        margin-top: 100px;
      }
          </style>
        </head>
        <body>
          ${elemento.innerHTML}
        </body>
      </html>
    `;
    const pdfBlob = await html2pdf().set(opt).from(html).outputPdf("blob");

    // Crear una URL temporal
    const url = URL.createObjectURL(pdfBlob);

    // Abrir en nueva ventana / pestaña
    window.open(url, "_blank");
  }
</script>
<template>
  <Content>
    <template #header>
      <div class="row mb-2">
        <div class="col-sm-6">
          <h1 class="m-0">Proformas > <small>Imprimir</small></h1>
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
            <li class="breadcrumb-item active">Imprimir</li>
          </ol>
        </div>
        <!-- /.col -->
      </div>
      <!-- /.row -->
    </template>
    <div class="row">
      <div class="col-md-12">
        <div class="row">
          <div class="col-12">
            <el-skeleton :loading="loadingProforma" animated class="row">
              <template #template>
                <div class="col-md-6 offset-md-3">
                  <el-skeleton-item style="height: 500px"></el-skeleton-item>
                </div>
              </template>
              <template #default>
                <div class="col-md-12">
                  <div class="card">
                    <div class="card-body">
                      <div class="row">
                        <div class="col-md-6">
                          <label>Cliente:</label>
                          <el-select-v2
                            v-model="cliente_id"
                            filterable
                            @input="onInputSelectClientes"
                            @change="filtraListado"
                            :reserve-keyword="false"
                            clearable
                            :options="listClientes"
                            :loading="loadingClientes"
                            placeholder="TODOS"
                            size="large"
                            no-data-text="Sin resultados"
                            loading-text="Buscando..."
                            class="rounded-0"
                            multiple
                          />
                        </div>
                        <div class="col-md-6">
                          <label>Seleccionar Sucursal</label>
                          <el-select
                            class="w-100"
                            v-model="sucursal_id"
                            filterable
                            placeholder="Seleccione"
                            no-data-text="Sin datos"
                            no-match-text="No se encontró"
                          >
                            <el-option
                              v-for="item in listSucursals"
                              :key="item.id"
                              :value="item.id"
                              :label="item.nombre"
                            ></el-option>
                          </el-select>
                        </div>
                      </div>

                      <div class="contenedor_impresion">
                        <div id="principal">
                          <div
                            class="contenedor_factura"
                            v-for="item in proformaDetallesAux"
                          >
                            <div class="header">
                              <div class="logo">
                                <img
                                  :src="
                                    configuracionStore.oConfiguracion.logo_b64
                                  "
                                  alt=""
                                />
                                <br />
                                Fecha: {{ item.fecha_ct }}
                              </div>
                              <div class="dir">
                                Av. Juan Pablo II N°2780 Zona 16 de Julio<br />Telf.:
                                2840248 Cel.: 73636537 - 76571953 - 767666777
                                <div class="tipo">
                                  <div>
                                    NOTA DE ENTREGA <span class="check"></span>
                                  </div>
                                  <div>
                                    PROFORMA <span class="check active">X</span>
                                  </div>
                                </div>
                              </div>
                              <div class="total">
                                <span class="monto">Bs {{ item.total }}</span
                                ><br />
                                <span class="nro">{{ item.codigo }}</span>
                              </div>
                            </div>
                            <div class="info">
                              <span class="tbold">Señor(a):</span>
                              {{ item.cliente.razon_social }}
                            </div>
                            <div class="contenido">
                              <table border="1">
                                <thead>
                                  <tr>
                                    <th width="20px">CANTIDAD</th>
                                    <th>DESCRIPCIÓN</th>
                                    <th>P. UNIT</th>
                                    <th>SUBTOTAL</th>
                                    <th>DESCUENTO</th>
                                    <th>TOTAL</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <template
                                    v-for="item_dp in item.proforma_detalle_productos"
                                  >
                                    <tr
                                      v-if="
                                        item_dp.cantidad && item_dp.cantidad > 0
                                      "
                                    >
                                      <td class="centreado">
                                        {{ item_dp.cantidad }}
                                      </td>
                                      <td>
                                        {{ item_dp.producto.nombre }}
                                        {{
                                          item_dp.producto.unidad_medida?.nombre
                                        }}
                                      </td>
                                      <td class="derecha">
                                        {{ item_dp.precio }}
                                      </td>
                                      <td class="derecha">
                                        {{ item_dp.subtotal }}
                                      </td>
                                      <td class="derecha">
                                        {{ item_dp.descuento ?? "0.00" }}
                                      </td>
                                      <td class="derecha">
                                        {{ item_dp.subtotal }}
                                      </td>
                                    </tr>
                                  </template>
                                  <tr>
                                    <td colspan="4"></td>
                                    <td class="tbold derecha">TOTAL</td>
                                    <td class="tbold derecha">
                                      {{ item.total }}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td colspan="4"></td>
                                    <td class="tbold derecha">DESCUENTO</td>
                                    <td class="tbold derecha">
                                      {{ item.descuento ?? "0.00" }}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td colspan="4">Son: {{ item.literal }}</td>
                                    <td class="tbold derecha">TOTAL FINAL</td>
                                    <td class="tbold derecha">
                                      {{ item.total }}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <div class="info_pagos">
                                <table>
                                  <tbody>
                                    <tr>
                                      <td>A cuenta:</td>
                                      <td>0.00</td>
                                      <td>Saldo:</td>
                                      <td></td>
                                      <td>Fecha:</td>
                                      <td>{{ oProforma.fecha_t }}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                              <div class="final">
                                <table>
                                  <tbody>
                                    <tr>
                                      <td>ENTREGUE PRODUCTO CONFORME</td>
                                      <td>RECIBÍ PRODUCTO CONFORME</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-12">
                          <button
                            class="btn btn-primary btn-block btn-flat mb-2"
                            id="btnImprimir"
                            @click.prevent="imprimirContenedor"
                          >
                            <i class="fa fa-print"></i> Imprimir
                          </button>
                          <router-link
                            class="btn btn-default w-100"
                            :to="{ name: 'proformas.index' }"
                          >
                            <i class="fa fa-arrow-left"></i> Volver
                          </router-link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </el-skeleton>
          </div>
        </div>
      </div>
    </div>
  </Content>
</template>
