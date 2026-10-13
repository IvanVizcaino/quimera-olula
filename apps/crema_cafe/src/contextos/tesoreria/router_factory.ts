import { RouterFactoryTesoreriaOlula } from '#/tesoreria/router_factory.ts';

const r = RouterFactoryTesoreriaOlula.router;

export class RouterFactoryTesoreriaCremaCafe {
    static router = {
        "tesoreria/recibo_venta": r["tesoreria/recibo_venta"],
        "tesoreria/recibo_compra": r["tesoreria/recibo_compra"],
        "tesoreria/remesa_pago": r["tesoreria/remesa_pago"],
    };
}
