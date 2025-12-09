<script setup>
  import {
    watch,
    ref,
    computed,
    onMounted,
    nextTick,
    reactive,
    onBeforeMount,
  } from "vue";
  import api from "../../../composables/axios.js";
  import { useRouter } from "vue-router";
  import { useAuthStore } from "../../../stores/authStore";
  const authStore = useAuthStore();
  const router = useRouter();
  // TOAST
  import { toast } from "vue3-toastify";
  import "vue3-toastify/dist/index.css";
  const props = defineProps({
    orden_venta: {
      type: Object,
      default: null,
    },
  });

  const enviando = ref(false);
  let form = reactive(props.orden_venta);
  const nuevoProducto = ref({
    cantidad: 1,
    codigoProducto: "",
  });

  watch(
    () => props.orden_venta,
    (newValue) => {
      form = newValue;
      verificarOrdenVenta();
    }
  );

  const textBtnDescuento = computed(() => {
    if (enviando.value) {
      return `<i class="fa fa-spin fa-spinner"></i> Enviando...`;
    }
    if (form.id == 0) {
      return `<i class="fa fa-save"></i> Guardar y Solicitar Descuento`;
    }

    if (form.solicitud_sw == 1) {
      return `<i class="fa fa-check"></i> Finalizar Orden de Venta`;
    }
    return `<i class="fa fa-edit"></i> Actualizar Orden de Venta`;
  });

  const textBtn = computed(() => {
    if (enviando.value) {
      return `<i class="fa fa-spin fa-spinner"></i> Enviando...`;
    }
    if (form.id == 0) {
      return `<i class="fa fa-save"></i> Finalizar Orden de Venta`;
    }
    return `<i class="fa fa-edit"></i> Actualizar Orden de Venta`;
  });

  const enviarFormulario = () => {
    let tituloConfirmar = "¿Completar Orden de Venta?";
    let mensajeConfirmar = `<strong>Una vez confirmada no se podrá modificar</strong>`;

    if (form.id != 0) {
      tituloConfirmar = "¿Modificar Orden de Venta?";
      mensajeConfirmar = `<strong>Se guardarán las modificaciones de la Orden de Venta</strong>`;
      if (form.solicitud_sw == 1) {
        tituloConfirmar = "¿Finalizar Orden de Venta?";
        mensajeConfirmar = `<strong>Se finalizará la Orden de Venta</strong>`;
      }
    } else {
      if (form.solicitud_descuento == 1) {
        tituloConfirmar = "¿Guardar Orden de Venta y Solicitar Descuento?";
        mensajeConfirmar = `<strong>Se guardará la Orden de Venta y se solicitará el descuento</strong>`;
      }
    }

    Swal.fire({
      icon: "question",
      title: tituloConfirmar,
      html: mensajeConfirmar,
      showCancelButton: true,
      confirmButtonText: "Si, confirmar",
      cancelButtonText: "No, cancelar",
      denyButtonText: `No, cancelar`,
      customClass: {
        confirmButton: "btn-primary",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        enviando.value = true;
        let url =
          form.id == 0
            ? "/admin/orden_ventas"
            : "/admin/orden_ventas/" + form.id;

        api
          .post(url, form)
          .then((response) => {
            console.log(response);

            const success =
              response.data.message ?? "Proceso realizado con éxito";
            Swal.fire({
              icon: "success",
              title: "Correcto",
              html: `<strong>${success}</strong>`,
              confirmButtonText: `Aceptar`,
              customClass: {
                confirmButton: "btn-success",
              },
            });
            router.push({ name: "orden_ventas.index" });
          })
          .catch((error) => {
            if (
              error.response &&
              error.response.data &&
              error.response.data.errors
            ) {
              const msgError = error.response.data.errors.error
                ? error.response.data.errors.error[0]
                : "Existen errores en el formulario, por favor verifique";
              Swal.fire({
                icon: "info",
                title: "Error",
                html: `<strong>${msgError}</strong>`,
                confirmButtonText: `Aceptar`,
                customClass: {
                  confirmButton: "btn-error",
                },
              });
              form.errors = error.response.data.errors;
            } else {
              const msgError =
                "Ocurrió un error inesperado contactese con el Administrador";
              Swal.fire({
                icon: "info",
                title: "Error",
                html: `<strong>${msgError}</strong>`,
                confirmButtonText: `Aceptar`,
                customClass: {
                  confirmButton: "btn-error",
                },
              });
              console.error("Error inesperado:", error);
            }
          })
          .finally(() => {
            enviando.value = false;
          });
      }
    });
  };

  const aprobarDescuento = () => {
    let tituloConfirmar = "¿Aprobar Descuento?";
    let mensajeConfirmar = `Se aprobará el descuento con un monto de ${form.descuento}<br/><strong>Una vez aprobada no se podrá deshacer</strong>`;
    Swal.fire({
      icon: "question",
      title: tituloConfirmar,
      html: mensajeConfirmar,
      showCancelButton: true,
      confirmButtonText: "Si, confirmar",
      cancelButtonText: "No, cancelar",
      denyButtonText: `No, cancelar`,
      customClass: {
        confirmButton: "btn-primary",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        api
          .post("/admin/orden_ventas/aprobar/" + form.id, {
            descuento: form.descuento,
            _method: "PUT",
          })
          .then((response) => {
            form.verificado = response.data.orden_venta.verificado;
            form.descuento = response.data.orden_venta.descuento;
            form.estado = response.data.orden_venta.estado;
            form.user_ap = response.data.orden_venta.user_ap;
            form.errors = null;
            Swal.fire({
              icon: "success",
              title: "Correcto",
              html: `<strong>${response.data.message}</strong>`,
              confirmButtonText: `Aceptar`,
              customClass: {
                confirmButton: "btn-success",
              },
            });
          })
          .catch((error) => {
            if (
              error.response &&
              error.response.data &&
              error.response.data.errors
            ) {
              const msgError = error.response.data.errors.error
                ? error.response.data.errors.error[0]
                : "Existen errores en el formulario, por favor verifique";
              Swal.fire({
                icon: "info",
                title: "Error",
                html: `<strong>${msgError}</strong>`,
                confirmButtonText: `Aceptar`,
                customClass: {
                  confirmButton: "btn-error",
                },
              });
              form.errors = error.response.data.errors;
            } else {
              const msgError =
                "Ocurrió un error inesperado contactese con el Administrador";
              Swal.fire({
                icon: "info",
                title: "Error",
                html: `<strong>${msgError}</strong>`,
                confirmButtonText: `Aceptar`,
                customClass: {
                  confirmButton: "btn-error",
                },
              });
              console.error("Error inesperado:", error);
            }
          })
          .finally(() => {
            enviando.value = false;
          });
      }
    });
  };

  const listSucursals = ref([]);
  const cargarProveedors = () => {
    api.get("/admin/sucursals/listadoSP").then((response) => {
      listSucursals.value = response.data.sucursals;
    });
  };

  const listUnidadMedidas = ref([]);
  const cargarUnidadMedidas = () => {
    api.get("/admin/unidad_medidas/listado").then((response) => {
      listUnidadMedidas.value = response.data.unidad_medidas;
    });
  };

  const listClientes = ref([]);
  const loadingClientes = ref(false);
  const remoteMethod = async (query) => {
    if (query !== "") {
      loadingClientes.value = true;
      try {
        const response = await api.get(
          "/admin/clientes/listadoSelectElementUi" +
            `?search=${encodeURIComponent(query)}`
        );
        console.log(response);
        const data = response.data.clientes;
        // Suponiendo que data es un array de clientes [{id, nombre}]
        listClientes.value = data.map((cliente) => ({
          value: cliente.id,
          // label: `${cliente.razon_social} - ${cliente.ci}`,
          label: `${cliente.razon_social}`,
        }));
      } catch (error) {
        console.log(error);
        listClientes.value = [];
      }
      loadingClientes.value = false;
    } else {
      listClientes.value = [];
    }
  };

  const cargarListas = () => {
    cargarProveedors();
    cargarUnidadMedidas();
  };

  const agregarProducto = () => {
    if (
      nuevoProducto.value.codigoProducto.trim() == "" ||
      ("" + nuevoProducto.value.cantidad).trim() == ""
    ) {
      toast.error("Debes ingresar la cantidad y el código de Producto", {
        html: `<i class="fa fa-times"></i>`,
      });
      return;
    }

    api
      .get("/admin/productos/byCodigo", {
        params: {
          codigo: nuevoProducto.value.codigoProducto,
        },
      })
      .then((response) => {
        if (!response.data) {
          Swal.fire({
            icon: "info",
            title: "Atención",
            html: `<strong>No se encontró ningún producto con el código ingresado</strong>`,
            confirmButtonText: `Aceptar`,
            customClass: {
              confirmButton: "btn-success",
            },
          });
          return;
        }
        const prod = response.data;
        const existe = form.orden_venta_detalles.filter(
          (elem) => elem.producto_id === prod.id
        );
        if (existe.length > 0) {
          toast.info("Ese producto ya fue agregado");
          return;
        }

        const subtotal =
          parseFloat(nuevoProducto.value.cantidad) * parseFloat(prod.precio);
        form.orden_venta_detalles.push({
          id: 0,
          orden_venta_id: 0,
          producto_id: prod.id,
          unidad_medida_id: prod.unidad_medida_id,
          producto: prod,
          cantidad: nuevoProducto.value.cantidad,
          precio: prod.precio,
          descuento: 0,
          subtotal: subtotal,
          subtotal_f: subtotal,
        });
        nuevoProducto.value.codigoProducto = "";
        calcularTotal();
        calcularTotalConDescuento();
        calcularCambio();
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          icon: "info",
          title: "Atención",
          html: `<strong>Ocurrió un error al intentar obtener el registro</strong>`,
          confirmButtonText: `Aceptar`,
          customClass: {
            confirmButton: "btn-success",
          },
        });
      });
  };

  const calcularSubtotalPorCantidad = (e, index) => {
    const elem = e.target;
    const value = elem.value;
    if (!value || value.trim() == "") {
      form.orden_venta_detalles[index].subtotal =
        form.orden_venta_detalles[index].precio;
      form.orden_venta_detalles[index].subtotal_f =
        parseFloat(form.orden_venta_detalles[index].subtotal) -
        parseFloat(form.orden_venta_detalles[index].descuento);
    }
    form.orden_venta_detalles[index].subtotal =
      parseFloat(value) * parseFloat(form.orden_venta_detalles[index].precio);

    form.orden_venta_detalles[index].subtotal_f =
      parseFloat(form.orden_venta_detalles[index].subtotal) -
      parseFloat(form.orden_venta_detalles[index].descuento);

    calcularTotal();
    calcularTotalConDescuento();
    calcularCambio();
  };
  const calcularSubtotalPorDescuento = (e, index) => {
    const elem = e.target;
    const value = elem.value;
    if (!value || value.trim() == "") {
      form.orden_venta_detalles[index].subtotal_f =
        form.orden_venta_detalles[index].subtotal;
    }
    form.orden_venta_detalles[index].subtotal_f =
      parseFloat(form.orden_venta_detalles[index].subtotal) - parseFloat(value);
    calcularTotal();
  };
  const calcularSubtotalPorCantidadIndex = (index) => {
    const value = form.orden_venta_detalles[index].cantidad;
    if (!value) {
      form.orden_venta_detalles[index].subtotal =
        form.orden_venta_detalles[index].precio;
    }
    form.orden_venta_detalles[index].subtotal =
      parseFloat(value) * parseFloat(form.orden_venta_detalles[index].precio);
    calcularTotal();
  };

  const calcularTotal = () => {
    if (form.orden_venta_detalles.length == 0) {
      form.total = 0;
      form.cantidad_total = 0;
      return;
    }
    let total = 0;
    total = form.orden_venta_detalles.reduce((acum, item) => {
      return acum + parseFloat(item.subtotal);
    }, 0);
    form.total = total;
    total = form.orden_venta_detalles.reduce((acum, item) => {
      return acum + parseFloat(item.subtotal_f);
    }, 0);
    form.total_f = total;
    total = form.orden_venta_detalles.reduce((acum, item) => {
      return acum + parseFloat(item.cantidad);
    }, 0);
    form.cantidad_total = total;
  };

  const calcularTotalConDescuento = () => {
    if (form.orden_venta_detalles.length == 0) {
      form.total = 0;
      form.cantidad_total = 0;
      return;
    }
    let total = 0;
    total = form.orden_venta_detalles.reduce((acum, item) => {
      return acum + parseFloat(item.subtotal);
    }, 0);
    form.total_f = total - form.descuento;
  };

  const detectarDescuento = () => {
    if (form.solicitud_descuento == 1) {
      form.total_f = form.total - form.descuento;
    } else {
      form.total_f = form.total;
    }
    calcularCambio();
  };

  const subTotalFinal = computed(() => {
    const subtotal = form.orden_venta_detalles.reduce((acum, item) => {
      return acum + parseFloat(item.subtotal_f);
    }, 0);
    form.total_st = subtotal;
    return subtotal;
  });

  const eliminarDetalle = (index, id) => {
    if (id != 0) {
      form.eliminados_detalles.push(id);
    }
    form.orden_venta_detalles.splice(index, 1);
    calcularTotal();
    calcularTotalConDescuento();
    calcularCambio();
  };

  const calcularCambio = () => {
    form.cambio = 0;
    if (form.total_f && form.cancelado && form.cancelado != 0) {
      form.cambio = parseFloat(form.total_f) - parseFloat(form.cancelado);
      form.cambio *= -1;
    }
  };

  const verificarOrdenVenta = async () => {
    await nextTick(() => {
      if (form.id != 0) {
        listClientes.value.push({
          value: form.cliente_id,
          label: `${form.cliente.razon_social}`,
        });

        // form.fecha = getFechaAtual();
        // form.hora = getHoraActual();
      }
      form.errors = null;
    });
  };

  onMounted(() => {
    cargarListas();
    verificarOrdenVenta();
  });
</script>

<template>
  <div class="row">
    <div class="col-md-5">
      <div class="card">
        <div class="card-body">
          <div class="row">
            <div class="col-md-12 mb-2">
              <label>Seleccionar Sucursal</label>
              <el-select
                class="w-100"
                :class="{
                  'parsley-error': form.errors?.sucursal_id,
                }"
                v-model="form.sucursal_id"
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
              <ul
                v-if="form.errors?.sucursal_id"
                class="d-block text-danger mb-0 list-unstyled"
              >
                <li class="parsley-required">
                  {{ form.errors?.sucursal_id[0] }}
                </li>
              </ul>
            </div>
            <div class="col-md-12 mb-2">
              <label>Buscar Cliente</label>
              <el-select-v2
                v-model="form.cliente_id"
                filterable
                remote
                :remote-method="remoteMethod"
                clearable
                :options="listClientes"
                :loading="loadingClientes"
                placeholder="Razón Social..."
                size="large"
                no-data-text="Sin resultados"
                loading-text="Buscando..."
                :class="{
                  'is-invalid': form.errors?.cliente_id,
                }"
                class="rounded-0"
              />
              <ul
                v-if="form.errors?.cliente_id"
                class="d-block text-danger mb-0 list-unstyled"
              >
                <li class="parsley-required">
                  {{ form.errors?.cliente_id[0] }}
                </li>
              </ul>
            </div>
            <div class="col-12">
              <div class="row">
                <div class="col-md-6 mb-2">
                  <label>Fecha</label>
                  <input
                    type="date"
                    class="form-control"
                    :class="{
                      'parsley-error': form.errors?.fecha,
                    }"
                    v-model="form.fecha"
                    autosize
                  />
                  <ul
                    v-if="form.errors?.fecha"
                    class="d-block text-danger mb-0 list-unstyled"
                  >
                    <li class="parsley-required">
                      {{ form.errors?.fecha[0] }}
                    </li>
                  </ul>
                </div>
                <div class="col-md-6 mb-2">
                  <label>Hora</label>
                  <input
                    type="time"
                    class="form-control"
                    :class="{
                      'parsley-error': form.errors?.hora,
                    }"
                    v-model="form.hora"
                    autosize
                  />
                  <ul
                    v-if="form.errors?.hora"
                    class="d-block text-danger mb-0 list-unstyled"
                  >
                    <li class="parsley-required">
                      {{ form.errors?.hora[0] }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="col-12">
              <h4>Agregar Productos</h4>
            </div>
            <div class="col-md-4 mb-2">
              <small class="text-muted font-weight-bold">Cantidad</small>
              <input
                type="number"
                class="form-control"
                v-model="nuevoProducto.cantidad"
                autosize
              />
            </div>
            <div class="col-md-8 mb-2">
              <small class="text-muted font-weight-bold"
                >Código de Producto</small
              >
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  v-model="nuevoProducto.codigoProducto"
                  @keypress.enter="agregarProducto"
                />
                <div class="input-group-append">
                  <button
                    class="btn btn-primary d-flex align-items-center justify-content-center"
                    @click.prevent="agregarProducto"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-7">
      <form @submit.prevent="enviarFormulario()">
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <div class="row">
                  <div class="col-12 overflow-auto">
                    <table class="table table-bordered mb-0">
                      <thead class="bg-secundario">
                        <tr>
                          <th>PRODUCTO</th>
                          <th style="min-width: 140px">UNIDAD MEDIDA</th>
                          <th width="100px">C/U</th>
                          <th style="min-width: 120px">CANTIDAD</th>
                          <th width="100px">SUBTOTAL</th>
                          <th style="min-width: 120px">DESCUENTO</th>
                          <th width="100px">SUBTOTAL FINAL</th>
                          <th width="1%"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <template v-if="form.orden_venta_detalles.length > 0">
                          <tr
                            v-for="(item, index) in form.orden_venta_detalles"
                          >
                            <td>{{ item.producto.nombre }}</td>
                            <td>
                              <select class="form-control">
                                <option
                                  v-for="item in listUnidadMedidas"
                                  :value="item.id"
                                >
                                  {{ item.nombre }}
                                </option>
                              </select>
                            </td>
                            <td>{{ item.precio }}</td>
                            <td>
                              <input
                                type="number"
                                step="1"
                                min="1"
                                class="form-control"
                                v-model="item.cantidad"
                                @change="
                                  calcularSubtotalPorCantidad($event, index)
                                "
                                @keyup="
                                  calcularSubtotalPorCantidad($event, index)
                                "
                              />
                            </td>
                            <td>{{ item.subtotal }}</td>
                            <td>
                              <input
                                type="number"
                                step="1"
                                min="1"
                                class="form-control"
                                v-model="item.descuento"
                                @change="
                                  calcularSubtotalPorDescuento($event, index)
                                "
                                @keyup="
                                  calcularSubtotalPorDescuento($event, index)
                                "
                              />
                            </td>
                            <td>{{ item.subtotal_f }}</td>
                            <td>
                              <button
                                class="btn btn-danger btn-sm"
                                @click.prevent="eliminarDetalle(index, item.id)"
                              >
                                X
                              </button>
                            </td>
                          </tr>
                        </template>
                        <template v-else>
                          <tr>
                            <td
                              colspan="4"
                              class="text-muted text-sm text-center"
                            >
                              NO SE AGREGARÓN PRODUCTOS
                            </td>
                          </tr>
                        </template>
                        <tr class="bg2">
                          <td class="font-weight-bold text-right" colspan="2">
                            TOTALES
                          </td>
                          <td></td>
                          <td>{{ form.cantidad_total }}</td>
                          <td>{{ form.total }}</td>
                          <td></td>
                          <td>{{ subTotalFinal }}</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <ul
                  v-if="form.errors?.orden_venta_detalles"
                  class="d-block text-danger mb-0 list-unstyled"
                >
                  <li class="parsley-required">
                    {{ form.errors?.orden_venta_detalles[0] }}
                  </li>
                </ul>
                <div class="row">
                  <div class="col-md-6">
                    <small class="font-weight-bold">Forma de pago</small><br />
                    <el-radio-group
                      v-model="form.forma_pago"
                      :disabled="form.id != 0 && form.forma_pago == 'CRÉDITO'"
                    >
                      <el-radio value="EFECTIVO">EFECTIVO</el-radio>
                      <el-radio value="QR">QR</el-radio>
                      <el-radio
                        value="CRÉDITO"
                        v-if="
                          authStore?.user?.permisos == '*' ||
                          authStore?.user?.permisos.includes(
                            'cuenta_cobrars.create'
                          )
                        "
                        >CRÉDITO</el-radio
                      >
                    </el-radio-group>
                  </div>
                  <div class="col-md-6">
                    <small class="font-weight-bold"
                      >Con Factura/Sin Factura</small
                    ><br />
                    <el-radio-group v-model="form.cs_f">
                      <el-radio value="CON FACTURA">CON FACTURA</el-radio>
                      <el-radio value="SIN FACTURA">SIN FACTURA</el-radio>
                    </el-radio-group>
                  </div>
                  <div class="col-12">
                    <div class="row">
                      <div
                        class="col-md-6"
                        v-if="form.solicitud_descuento == 1"
                      >
                        <small class="font-weight-bold">Descuento</small>
                        <small
                          v-if="form.id != 0 && form.verificado == 0"
                          class="font-weight-bold"
                          :class="{
                            'text-success': form.solicitud_sw == 1,
                            'text-danger': form.solicitud_sw == 0,
                          }"
                        >
                          ({{
                            form.solicitud_sw == 0 ? "Sin aprobar" : "Aprobado"
                          }})</small
                        >
                        <input
                          type="number"
                          v-model="form.descuento"
                          class="form-control"
                          @keyup="calcularTotalConDescuento"
                          :disabled="form.verificado == 1"
                        />
                        <ul
                          v-if="form.errors?.descuento"
                          class="d-block text-danger mb-0 list-unstyled"
                        >
                          <li class="parsley-required">
                            {{ form.errors?.descuento[0] }}
                          </li>
                        </ul>
                        <button
                          v-if="
                            form.id != 0 &&
                            form.verificado == 0 &&
                            (authStore?.user?.permisos == '*' ||
                              authStore?.user?.permisos.includes(
                                'orden_ventas.aprobar_descuentos'
                              ))
                          "
                          class="btn btn-success btn-sm w-100 mt-1 text-xs"
                          @click.prevent="aprobarDescuento"
                        >
                          <i class="fa fa-check"></i>
                          Aprobar Descuento
                        </button>
                      </div>
                      <div class="col-md-6">
                        <small class="font-weight-bold"
                          >Descuento adicional</small
                        ><br />
                        <el-radio-group
                          v-model="form.solicitud_descuento"
                          @change="detectarDescuento"
                        >
                          <el-radio :value="0">SIN DESCUENTO</el-radio>
                          <el-radio :value="1">CON DESCUENTO</el-radio>
                        </el-radio-group>
                      </div>
                    </div>
                  </div>
                  <div class="col-12">
                    <small class="font-weight-bold">Total Pagar</small>
                    <input
                      type="number"
                      v-model="form.total_f"
                      class="form-control"
                      readonly
                    />
                  </div>
                  <div class="col-12">
                    <small class="font-weight-bold">Cancelado</small>
                    <input
                      type="number"
                      v-model="form.cancelado"
                      class="form-control"
                      @keyup="calcularCambio"
                    />
                    <ul
                      v-if="form.errors?.cancelado"
                      class="d-block text-danger mb-0 list-unstyled"
                    >
                      <li class="parsley-required">
                        {{ form.errors?.cancelado[0] }}
                      </li>
                    </ul>
                  </div>
                  <div class="col-12">
                    <small class="font-weight-bold">Dar cambio</small>
                    <input
                      type="number"
                      v-model="form.cambio"
                      class="form-control"
                      :class="{
                        'bg-danger': form.cambio < 0,
                      }"
                    />
                  </div>
                  <ul
                    v-if="form.errors?.total"
                    class="d-block text-danger mb-0 list-unstyled w-100"
                  >
                    <li class="parsley-required">
                      {{ form.errors?.total[0] }}
                    </li>
                  </ul>
                  <ul
                    v-if="form.errors?.total_f"
                    class="d-block text-danger mb-0 list-unstyled w-100"
                  >
                    <li class="parsley-required">
                      {{ form.errors?.total_f[0] }}
                    </li>
                  </ul>
                  <div class="col-12 my-1">
                    <button
                      v-if="form.solicitud_descuento == 1"
                      class="btn btn-primary w-100"
                      v-html="textBtnDescuento"
                      :disabled="enviando"
                      @click.prevent="enviarFormulario"
                    ></button>
                    <button
                      v-if="form.solicitud_descuento == 0"
                      class="btn btn-primary w-100"
                      v-html="textBtn"
                      :disabled="enviando"
                      @click.prevent="enviarFormulario"
                    ></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
