<script setup>
  import { watch, ref, computed, onMounted, nextTick, reactive } from "vue";
  import api from "../../../composables/axios.js";
  import { useRouter } from "vue-router";
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
    }
  );

  const textBtn = computed(() => {
    if (enviando.value) {
      return `<i class="fa fa-spin fa-spinner"></i> Enviando...`;
    }
    if (form.id == 0) {
      return `<i class="fa fa-save"></i> Guardar`;
    }
    return `<i class="fa fa-edit"></i> Actualizar`;
  });

  const enviarFormulario = () => {
    Swal.fire({
      icon: "question",
      title: "¿Completar Orden de Venta?",
      html: `<strong>Una vez confirmada no se podrá modificar</strong>`,
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

  const getFechaAtual = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getHoraActual = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
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
          costo: prod.precio,
          descuento: 0,
          subtotal: subtotal,
          subtotal_f: subtotal,
        });
        nuevoProducto.value.codigoProducto = "";
        calcularTotal();
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
        form.orden_venta_detalles[index].costo;
      form.orden_venta_detalles[index].subtotal_f =
        parseFloat(form.orden_venta_detalles[index].subtotal) -
        parseFloat(form.orden_venta_detalles[index].descuento);
    }
    form.orden_venta_detalles[index].subtotal =
      parseFloat(value) * parseFloat(form.orden_venta_detalles[index].costo);

    form.orden_venta_detalles[index].subtotal_f =
      parseFloat(form.orden_venta_detalles[index].subtotal) -
      parseFloat(form.orden_venta_detalles[index].descuento);

    calcularTotal();
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
        form.orden_venta_detalles[index].costo;
    }
    form.orden_venta_detalles[index].subtotal =
      parseFloat(value) * parseFloat(form.orden_venta_detalles[index].costo);
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

  const eliminarDetalle = (index, id) => {
    if (id != 0) {
      form.eliminados_detalles.push(id);
    }
    form.orden_venta_detalles.splice(index, 1);
  };

  const calcularCambio = () => {
    form.cambio = 0;
    if (form.total_f && form.cancelado) {
      form.cambio = parseFloat(form.total_f) - parseFloat(form.cancelado);
      form.cambio *= -1;
    }
  };

  onMounted(() => {
    cargarListas();
    console.log(form.id);
    // if (form.id == 0) {

    //   form.fecha = getFechaAtual();
    //   form.hora = getHoraActual();
    // }
    form.errors = null;
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
                            <td>{{ item.costo }}</td>
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
                          <td>{{ form.cantidad_total }}</td>
                          <td>{{ form.total }}</td>
                          <td></td>
                          <td></td>
                          <td>{{ form.total_f }}</td>
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
                  <div class="col-12">
                    <small class="font-weight-bold">Forma de pago</small>
                    <select v-model="form.forma_pago" class="form-control">
                      <option value="EFECTIVO">EFECTIVO</option>
                      <option value="QR">QR</option>
                      <option value="CRÉDITO">CRÉDITO</option>
                    </select>
                  </div>
                  <div class="col-12">
                    <small class="font-weight-bold"
                      >Con Factura/Sin Factura</small
                    >
                    <select v-model="form.cs_f" class="form-control">
                      <option value="CON FACTURA">CON FACTURA</option>
                      <option value="SIN FACTURA">SIN FACTURA</option>
                    </select>
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
                    />
                  </div>

                  <ul
                    v-if="form.errors?.total"
                    class="d-block text-danger mb-0 list-unstyled"
                  >
                    <li class="parsley-required">
                      {{ form.errors?.total[0] }}
                    </li>
                  </ul>

                  <ul
                    v-if="form.errors?.total_f"
                    class="d-block text-danger mb-0 list-unstyled"
                  >
                    <li class="parsley-required">
                      {{ form.errors?.total_f[0] }}
                    </li>
                  </ul>
                  <div class="col-12 my-1">
                    <button
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
