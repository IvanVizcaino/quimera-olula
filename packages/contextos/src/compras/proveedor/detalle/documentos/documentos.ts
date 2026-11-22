/** Documentos del proveedor y la regla con que se ve cada subpestaña. */
export const documentosProveedor = [
    { texto: "Pedidos", regla: "compras.pedido.leer" },
    { texto: "Albaranes", regla: "compras.albaran.leer" },
    { texto: "Facturas", regla: "compras.factura.leer" },
    { texto: "Recibos", regla: "tesoreria.recibo_compra" },
];

/** Pendientes de pago: los que no están pagados. */
export const ESTADOS_RECIBO_COMPRA_PENDIENTE = ["Emitido", "Devuelto", "Remesado"];
