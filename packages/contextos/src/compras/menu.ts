export const menuCompras = {
    "Compras": { icono: "menu_compras", area: "Operaciones" },
    "Compras/Resumen": { url: "/dashboard/compras" },
    "Compras/Pedidos": { url: "/compras/pedido", regla: "compras.pedido" },
    "Compras/Albaranes": { url: "/compras/albaran", regla: "compras.albaran" },
    "Compras/Facturas": { alias: ["facturas recibidas", "proveedores"], url: "/compras/factura", regla: "compras.factura" },
    "Compras/Proveedores": { url: "/compras/proveedor", regla: "compras.proveedor" },
    "Compras/Artículos": { url: "/compras/articulo", regla: "compras.articulo" },
};
