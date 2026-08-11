export const menuVentas = {
    "Ventas": { icono: "fichero" },
    "Ventas/Clientes": { url: "/ventas/cliente", regla: "ventas.cliente.leer" },
    "Ventas/Presupuestos": { url: "/ventas/presupuesto", regla: "ventas.presupuesto.leer" },
    "Ventas/Pedidos": {
        url: "/ventas/pedido",
        regla: "ventas.pedido.leer",
        descripcionIA: "Gestiona pedidos de venta: crear un pedido nuevo para un cliente con líneas de artículos, consultar o modificar pedidos existentes.",
        parametrosIA: {
            cliente_id: "id del cliente para el que se crea o consulta el pedido",
            articulo_id: "id del artículo a añadir como línea del pedido",
        },
    },
    "Ventas/Albaranes": { url: "/ventas/albaran", regla: "ventas.albaran.leer" },
    "Ventas/Facturas": { url: "/ventas/factura", regla: "ventas.factura.leer" },
};