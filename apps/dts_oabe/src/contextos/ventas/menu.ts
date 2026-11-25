export const menuVentas = {
    Ventas: { icono: "fichero" },
    "Ventas/Clientes": { url: "/ventas/cliente", regla: "ventas.cliente.leer" },
    "Ventas/Presupuestos": { url: "/ventas/presupuesto", regla: "ventas.presupuesto.leer" },
    "Ventas/Pedidos": { url: "/ventas/pedido", regla: "ventas.pedido.leer" },
    "Ventas/Comparativa de ventas": {
        url: "/ventas/comparativa_ventas",
        regla: "ventas.factura",
    },
};
