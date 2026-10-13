import { RouterFactoryComprasOlula } from '#/compras/router_factory.ts';

const r = RouterFactoryComprasOlula.router;

export class RouterFactoryComprasCremaCafe {
    static router = {
        "compras/pedido": r["compras/pedido"],
        "compras/pedido/:id": r["compras/pedido"],
        "compras/albaran": r["compras/albaran"],
        "compras/factura": r["compras/factura"],
        "compras/proveedor": r["compras/proveedor"],
        "compras/articulo": r["compras/articulo"],
        "compras/albaranar-pedido/:id": r["compras/albaranar-pedido/:id"],
    };
}
