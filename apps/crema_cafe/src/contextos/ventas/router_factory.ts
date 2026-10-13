import { RouterFactoryVentasOlula } from '#/ventas/router_factory.ts';

const r = RouterFactoryVentasOlula.router;

// Solo las pantallas del circuito de ventas a crédito (T1.1); sin artículos ni tarifas de Ventas.
export class RouterFactoryVentasCremaCafe {
    static router = {
        "ventas/cliente": r["ventas/cliente"],
        "ventas/presupuesto": r["ventas/presupuesto"],
        "ventas/pedido": r["ventas/pedido"],
        "ventas/pedido/:id": r["ventas/pedido"],
        "ventas/albaran": r["ventas/albaran"],
        "ventas/factura": r["ventas/factura"],
        "ventas/albaranar-pedido/:id": r["ventas/albaranar-pedido/:id"],
        "ventas/aprobar-presupuesto/:id": r["ventas/aprobar-presupuesto/:id"],
    };
}
