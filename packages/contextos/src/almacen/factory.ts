import { metaTablaArticuloBase } from "./articulo/maestro/MaestroConDetalleArticulo.tsx"
import { menuAlmacen } from "./menu.ts"

export class FactoryAlmacenOlula {
    /** Columnas del maestro de artículos; una app puede sustituirlas (orden incluido). */
    static articulo_metaTabla = metaTablaArticuloBase
    static menu = menuAlmacen
}
