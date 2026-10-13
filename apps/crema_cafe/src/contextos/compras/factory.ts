import type { Articulo } from '#/compras/articulo/diseño.ts';
import { FactoryComprasOlula } from '#/compras/factory.ts';
import { menuCompras } from '#/compras/menu.ts';
import type { MetaTabla } from '@olula/componentes/atomos/qtabla.tsx';
import { metaTablaArticuloCremaCafe } from '../almacen/factory.ts';

const {
    Compras: cabecera,
    "Compras/Pedidos": pedidos,
    "Compras/Albaranes": albaranes,
    "Compras/Facturas": facturas,
    "Compras/Proveedores": proveedores,
    "Compras/Artículos": articulos,
} = menuCompras;

export class FactoryComprasCremaCafe extends FactoryComprasOlula {
    // CC-02: mismo orden de columnas que Almacén/Artículos (descr→ref→familia→subfamilia→uso).
    static override articulo_metaTabla =
        metaTablaArticuloCremaCafe as unknown as MetaTabla<Articulo>;

    // T1.1 + T3.1 + D2 F-01: circuito compras; artículos compra + precios proveedor (`compras/articulo`).
    static override menu = {
        Compras: cabecera,
        "Compras/Pedidos": pedidos,
        "Compras/Albaranes": albaranes,
        "Compras/Facturas": facturas,
        "Compras/Proveedores": proveedores,
        "Compras/Artículos": articulos,
    } as typeof FactoryComprasOlula.menu;
}
