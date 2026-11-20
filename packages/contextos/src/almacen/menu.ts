// Cajas, órdenes, ubicaciones, tipos de caja, zonas y pedidos de compra/venta del
// almacén son del SGA: sólo con su plugin activo.
export const menuAlmacen = {
    "Almacén": { icono: "menu_almacen", area: "Operaciones" },
    "Almacén/Resumen": { url: "/dashboard/almacen" },
    "Almacén/Artículos": { url: "/almacen/articulo", regla: "almacen.articulo" },
    "Almacén/Almacenes": { url: "/almacen/almacenes", regla: "almacen.almacen" },
    "Almacén/Cajas": { url: "/almacen/cajas", regla: "almacen.caja", plugin: "sga" },
    "Almacén/Familias": { url: "/almacen/familias", regla: "almacen.familia" },
    // Extensión pesos_medidas de Eneboo: solo con su plugin activo.
    "Almacén/Unidades de pesos y medidas": {
        alias: ["unidades", "medidas", "pesos"],
        url: "/almacen/pesos_medidas",
        regla: "almacen.peso_medida",
        plugin: "pesos_medidas",
    },
    "Almacén/Transferencias de Stock": { url: "/almacen/transferencias", regla: "almacen.transferencia_stock.leer" },
    "Almacén/Órdenes": { url: "/almacen/ordenes", regla: "almacen.orden.leer", plugin: "sga" },
    "Almacén/Pedidos de Compra": { url: "/almacen/pedidos_compra", regla: "almacen.pedido_compra.leer", plugin: "sga" },
    "Almacén/Pedidos de Venta": { url: "/almacen/pedidos_venta", regla: "almacen.pedido_venta.leer", plugin: "sga" },
    "Almacén/Stock": { alias: ["existencias", "inventario"], url: "/almacen/stock", regla: "almacen.stock" },
    "Almacén/Ubicaciones": { url: "/almacen/ubicaciones", regla: "almacen.ubicacion", plugin: "sga" },
    "Almacén/Tipos de Caja": { url: "/almacen/tipos_caja", regla: "almacen.tipo_caja", plugin: "sga" },
    "Almacén/Tipos de Ubicación": { url: "/almacen/tipos_ubicacion", regla: "almacen.tipo_ubicacion", plugin: "sga" },
    "Almacén/Clases de almacenamiento": { url: "/almacen/clases_almacenamiento", regla: "almacen.clase_almacenamiento", plugin: "sga" },
    "Almacén/Mapa del almacén": { alias: ["plano", "layout"], url: "/almacen/mapa", regla: "almacen.ubicacion", plugin: "sga" },
    "Almacén/Picking fijo": { url: "/almacen/picking_fijo", regla: "almacen.picking_fijo", plugin: "sga" },
    "Almacén/Reposición de picking": { url: "/almacen/reposicion", regla: "almacen.picking_fijo", plugin: "sga" },
    "Almacén/Slotting": { url: "/almacen/slotting", regla: "almacen.picking_fijo", plugin: "sga" },
    "Almacén/Zonas": { url: "/almacen/zonas", regla: "almacen.zona", plugin: "sga" },
};
