<script setup>
  import Content from "../../../Components/Content.vue";
  import { useOrdenVentas } from "../../../composables/orden_ventas/useOrdenVentas";
  import { ref, onMounted, onBeforeMount } from "vue";
  import { useAppStore } from "../../../stores/aplicacion/appStore";
  import { useAuthStore } from "../../../stores/authStore";
  import api from "../../../composables/axios.js";
  import { useRouter } from "vue-router";
  import { useConfiguracionStore } from "../../../stores/configuracion/configuracionStore";
  import html2pdf from "html2pdf.js";
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

  const { setOrdenVenta, limpiarOrdenVenta, oOrdenVenta } = useOrdenVentas();
  const loadingOrdenVenta = ref(true);
  const literal = ref("");
  const cargarOrdenVenta = () => {
    loadingOrdenVenta.value = true;
    api.get("/admin/orden_ventas/" + props.id).then((response) => {
      setOrdenVenta(response.data.orden_venta, true);
      literal.value = response.data.literal;
      loadingOrdenVenta.value = false;
    });
  };

  function formatDMY(fecha) {
    const d = new Date(fecha);
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const anio = d.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }
  onMounted(() => {
    cargarOrdenVenta();
    appStore.stopLoading();
  });

  // function imprimirContenedor() {
  //   // Obtener el contenido del contenedor
  //   const divContents = document.getElementById("principal").innerHTML;

  //   // Crear un iframe oculto
  //   const iframe = document.createElement("iframe");
  //   iframe.style.position = "absolute";
  //   iframe.style.width = "0";
  //   iframe.style.height = "0";
  //   iframe.style.border = "0";
  //   document.body.appendChild(iframe);

  //   const doc = iframe.contentWindow.document;
  //   doc.open();
  //   doc.write(`
  //   <html>
  //     <head>
  //       <style>
  //         @page { margin: 0; }

  //         #principal {
  //           width: 6.4cm !important;
  //         }

  //         #contenedor_imprimir {
  //           font-size: 9pt;
  //           width: 6.4cm !important;
  //           padding-top: 15px;
  //           padding-bottom: 15px;
  //           font-family: 'Times New Roman', Times, serif;
  //         }

  //         .elemento {
  //           text-align: center;
  //           font-size: 0.9em;
  //         }

  //         .elemento.logo img {
  //           width: 60%;
  //         }

  //         .separador {
  //           padding: 0px;
  //           margin: 0px;
  //         }

  //         .fono,
  //         .lp {
  //           font-size: 0.8em;
  //         }

  //         .txt_fo {
  //           margin-top: 3px;
  //           border-top: dashed 1px black;
  //         }

  //         .detalle {
  //           border-top: dashed 1px black;
  //           border-bottom: dashed 1px black;
  //         }

  //         .act_eco {
  //           font-size: 0.7em;
  //         }

  //         .info1, .info2 {
  //           text-align: center;
  //           font-weight: bold;
  //           font-size: 0.7em;
  //         }

  //         .izquierda {
  //           text-align: left;
  //           padding-left: 5px;
  //         }

  //         .derecha {
  //           text-align: right;
  //           padding-right: 5px;
  //         }

  //         .informacion {
  //           padding: 5px;
  //           width: 100%;
  //         }

  //         .bold {
  //           font-weight: bold;
  //         }

  //         .cobro {
  //           width: 100%;
  //           padding: 5px;
  //         }

  //         .cobro table {
  //           width: 97%;
  //           border-collapse: collapse;
  //         }

  //         .cobro table tr td {
  //           font-size: 0.7em;
  //           word-break: break-all;
  //         }

  //         .cobro table tr td:nth-child(3) {
  //           word-break: normal;
  //         }

  //         .cobro table tr.punteado td {
  //           border-top: dashed 1px black;
  //           border-bottom: dashed 1px black;
  //         }

  //         .cobro table tr.punteado_top td {
  //           border-top: dashed 1px black;
  //         }

  //         .literal {
  //           font-size: 0.85em;
  //         }

  //         .cod_control,
  //         .fecha_emision {
  //           font-size: 0.9em;
  //         }

  //         .qr img {
  //           width: 160px;
  //           height: 160px;
  //         }

  //         .total {
  //           font-size: 0.9em !important;
  //         }

  //         .pr-10 {
  //           padding-right: 10px;
  //           font-size: 9pt !important;
  //         }

  //         .centreado {
  //           text-align: center;
  //         }
  //       </style>
  //     </head>
  //     <body>
  //       ${divContents}
  //     </body>
  //   </html>
  // `);
  //   doc.close();

  //   // Esperar a que el iframe cargue
  //   iframe.onload = function () {
  //     iframe.contentWindow.focus();
  //     iframe.contentWindow.print();
  //     document.body.removeChild(iframe); // limpiar
  //   };
  // }

  async function imprimirContenedor() {
    const elemento = document.getElementById("principal");

    const opt = {
      margin: 0,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "cm", format: [6.4, 20], orientation: "portrait" },
    };

    // Generar el PDF como blob
    const pdfBlob = await html2pdf().set(opt).from(elemento).outputPdf("blob");

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
          <h1 class="m-0">Orden de Ventas > <small>Imprimir</small></h1>
        </div>
        <!-- /.col -->
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-right">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'Inicio' }">Inicio</router-link>
            </li>
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'orden_ventas.index' }"
                >Orden de Ventas</router-link
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
            <el-skeleton :loading="loadingOrdenVenta" animated class="row">
              <template #template>
                <div class="col-md-6 offset-md-3">
                  <el-skeleton-item style="height: 500px"></el-skeleton-item>
                </div>
              </template>
              <template #default>
                <div class="col-md-6 offset-md-3">
                  <div class="card">
                    <div class="card-body">
                      <div id="principal">
                        <div
                          class="contenedor_factura ml-auto mr-auto"
                          id="contenedor_imprimir"
                        >
                          <div class="elemento logo">
                            <img
                              :src="configuracionStore.oConfiguracion.logo_b64"
                              alt="Logo"
                            />
                          </div>
                          <div class="elemento nom_empresa">
                            "{{
                              configuracionStore.oConfiguracion.nombre_sistema
                            }}"
                          </div>
                          <div class="elemento txt_fo">ORDEN DE VENTA</div>
                          <div class="elemento detalle izquierda">
                            Nro: {{ oOrdenVenta.codigo }} <br />
                            Fecha: {{ formatDMY(oOrdenVenta.fecha) }} <br />
                            Hora: {{ oOrdenVenta.hora }} <br />
                            Cliente: {{ oOrdenVenta.cliente.razon_social }}
                            <br />
                            NIT: {{ oOrdenVenta.cliente.nit }} <br />
                            Usuario: {{ oOrdenVenta.user.nombre }}
                            {{ oOrdenVenta.user.paterno }} <br />
                            Forma de Pago: {{ oOrdenVenta.forma_pago }} <br />
                          </div>
                          <div class="elemento">DETALLE</div>
                          <div class="cobro">
                            <table>
                              <tr class="punteado">
                                <td class="centreado" width="40px">CANT.</td>
                                <td class="centreado"></td>
                                <td class="centreado">PROD.</td>
                                <td class="centreado">C/U</td>
                                <td class="centreado">SUBTOTAL</td>
                                <td class="centreado">DESCUENTO</td>
                                <td class="centreado">SUBTOTAL</td>
                              </tr>
                              <tr
                                v-for="item in oOrdenVenta.orden_venta_detalles"
                              >
                                <td class="centreado">
                                  {{ item.cantidad }}
                                </td>
                                <td class="izquierda">
                                  {{ item.unidad_medida.nombre }}
                                </td>
                                <td class="izquierda">
                                  {{ item.producto.nombre }}
                                </td>
                                <td class="centreado">{{ item.precio }}</td>
                                <td class="centreado">{{ item.subtotal }}</td>
                                <td class="centreado">{{ item.descuento }}</td>
                                <td class="centreado">
                                  {{ item.subtotal_f }}
                                </td>
                              </tr>
                            </table>
                            <table>
                              <tr class="punteado_top">
                                <td colspan="3" class="bold derecha">TOTAL</td>
                                <td class="bold elemento derecha pr-10">
                                  {{ oOrdenVenta.total_st }}
                                </td>
                              </tr>
                              <tr class="">
                                <td colspan="3" class="bold derecha">
                                  DESCUENTO
                                </td>
                                <td class="bold elemento derecha pr-10">
                                  {{ oOrdenVenta.descuento ?? 0 }}
                                </td>
                              </tr>
                              <tr class="">
                                <td colspan="3" class="bold derecha">
                                  TOTAL FINAL
                                </td>
                                <td class="bold elemento derecha pr-10">
                                  {{ oOrdenVenta.total_f }}
                                </td>
                              </tr>
                            </table>
                          </div>
                          <div class="izquierda literal">
                            Son: {{ literal }}
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
                            :to="{ name: 'orden_ventas.index' }"
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
<style scoped>
  /* FACURA */
  .contenedor_factura {
    font-size: 9pt;
    width: 6.4cm !important;
    padding-top: 15px;
    padding-bottom: 15px;
    font-family: "Times New Roman", Times, serif;
  }

  .col-md-4.contenedor_factura {
    margin-left: auto;
    margin-right: auto;
  }

  .elemento {
    text-align: center;
    font-size: 0.8em;
  }

  .elemento.logo img {
    width: 60%;
  }

  .separador {
    padding: 0px;
    margin: 0px;
  }

  .fono,
  .lp {
    font-size: 0.7em;
  }

  .txt_fo {
    margin-top: 3px;
    border-top: dashed 1px black;
  }

  .detalle {
    border-top: dashed 1px black;
    border-bottom: dashed 1px black;
  }

  .act_eco {
    font-size: 0.68em;
  }

  .info1 {
    text-align: center;
    font-weight: bold;
    font-size: 0.7em;
  }

  .info2 {
    text-align: center;
    font-weight: bold;
    font-size: 0.67em;
  }

  .izquierda {
    text-align: left;
    padding-left: 5px;
  }

  .derecha {
    text-align: right;
    padding-right: 5px;
  }

  .informacion {
    padding: 5px;
    width: 100%;
  }

  .bold {
    font-weight: bold;
  }

  .cobro {
    width: 100%;
    padding: 5px;
  }

  .cobro table {
    width: 98%;
  }

  .centreado {
    text-align: center;
  }

  .cobro table tr td {
    font-size: 0.8em;
    word-break: break-all;
  }

  .cobro table tr td:nth-child(3),
  .cobro table tr td:nth-child(41) {
    word-break: normal;
  }

  .literal {
    font-size: 0.85em;
  }

  .cod_control,
  .fecha_emision {
    font-size: 0.9em;
  }

  .cobro table {
    border-collapse: collapse;
  }

  .cobro table tr.punteado td {
    border-top: dashed 1px black;
    border-bottom: dashed 1px black;
  }

  .cobro table tr.punteado_top td {
    border-top: dashed 1px black;
  }

  .qr img {
    width: 160px;
    height: 160px;
  }

  .total {
    font-size: 0.9em !important;
  }

  .pr-10 {
    padding-right: 10px;
    font-size: 9pt !important;
  }

  @media (max-width: 800px) {
    .col-md-4.contenedor_factura {
      margin-left: 0px !important;
      margin-right: 0px !important;
      width: 100% !important;
    }
  }
</style>
