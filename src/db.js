// src/db.js
import Dexie from "dexie";

// Crea la instancia de la base de datos
export const db = new Dexie("VidDB");

// Define el esquema de la base de datos y las tablas
db.version(1).stores({
  orden_ventas:
    "++id, nro,codigo,sucursal_id,cliente_id,fecha,hora,fecha_c,cantidad_total,total,total_st,solicitud_descuento,solicitud_sw,user_ap,monto_solicitud,descuento,total_f,forma_pago,cancelado,cambio,cs_f,observaciones,estado,verificado,user_id,sync",
  proformas:
    "++id,nro,codigo,sucursal_id,cliente_id,fecha,hora,cantidad_total,total,total_st,solicitud_descuento,descuento,total_f,forma_pago,cs_f,observaciones,user_id,sync",
  cuenta_cobrars:
    "++id,cliente_id,orden_venta_id,total,cancelado,saldo,fecha,hora,sync",
  clientes: "++id, razon_social, categoria, sync",
  devolucion_clientes:
    "++id, sucursal_id, cliente_id, cantidad_total, total, fecha, hora, observaciones, user_id",
  sucursals: "++id, nombre, almacen",
  unidad_medidas: "++id, nombre",
  productos:
    "++id, codigo,nombre,unidades_caja,descripcion,categoria_id,marca_id,precio,precio_ppp,ppp,unidad_medida_id,estado,imagen,url_imagen",
  sucursal_productos:
    "id_c, sucursal_id, producto_id, cantidad_ideal, cantidad_minima, stock_actual",
});
