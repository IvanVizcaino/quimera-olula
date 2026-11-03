import { UrlsTraza } from "#/comun/componentes/traza/diseño.ts";

export class FactoryComunLegacy {
    static traza_urls: UrlsTraza = {
        presupuesto_venta: (id) => `/ventas/presupuestos/${id}`,
        pedido_venta: (id) => `/ventas/pedidos/${id}`,
        albaran_venta: (id) => `/ventas/albaranes/${id}`,
        factura_venta: (id) => `/ventas/facturas/${id}`,
        recibo_cobro: null,
    };
}
