import { metaTablaArticuloBase } from "./articulo/maestro/MaestroConDetalleArticulo.tsx";
import { menuCompras } from "./menu.ts";

export class FactoryComprasOlula {
    /** Columnas del maestro compras/artículo; una app puede sustituirlas (orden incluido). */
    static articulo_metaTabla = metaTablaArticuloBase;
    static menu = menuCompras;
}
