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
  const literal = ref("");
  const cargarProforma = async () => {
    loadingProforma.value = true;
    if (!connectivityStore.isOnline) {
      const data = await proformaStore.getProformaById(parseInt(props.id));
      setProforma(data, true);
      literal.value = data.literal_txt;
      loadingProforma.value = false;
    } else {
      api.get("/admin/proformas/" + props.id).then((response) => {
        setProforma(response.data.proforma, true);
        literal.value = response.data.literal;
        loadingProforma.value = false;
      });
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
      minWidth = `18cm`;
    }
    const html = `
      <html>
        <head>
          <style>
      .contenedor_factura {
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
                      <div class="contenedor_impresion">
                        <div id="principal">
                          <div class="contenedor_factura">
                            <div class="header">
                              <div class="logo">
                                <img
                                  :src="
                                    configuracionStore.oConfiguracion.logo_b64
                                  "
                                  alt=""
                                />
                                <br />
                                Fecha: {{ oProforma.fecha_ct }}
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
                                <span class="monto"
                                  >Bs {{ oProforma.total_f }}</span
                                ><br />
                                <span class="nro">{{ oProforma.codigo }}</span>
                              </div>
                            </div>
                            <div class="info">
                              <span class="tbold">Señor(a):</span>
                              {{ oProforma.cliente.razon_social }}
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
                                  <tr
                                    v-for="item in oProforma.proforma_detalles"
                                  >
                                    <td class="centreado">
                                      {{ item.cantidad }}
                                    </td>
                                    <td>
                                      {{ item.producto.nombre }}
                                      {{ item.unidad_medida.nombre }}
                                    </td>
                                    <td class="derecha">{{ item.precio }}</td>
                                    <td class="derecha">{{ item.subtotal }}</td>
                                    <td class="derecha">
                                      {{ item.descuento }}
                                    </td>
                                    <td class="derecha">
                                      {{ item.subtotal_f }}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td colspan="4"></td>
                                    <td class="tbold derecha">TOTAL</td>
                                    <td class="tbold derecha">
                                      {{ oProforma.total_st }}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td colspan="4"></td>
                                    <td class="tbold derecha">DESCUENTO</td>
                                    <td class="tbold derecha">
                                      {{ oProforma.descuento }}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td colspan="4">Son: {{ literal }}</td>
                                    <td class="tbold derecha">TOTAL FINAL</td>
                                    <td class="tbold derecha">
                                      {{ oProforma.total_f }}
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
