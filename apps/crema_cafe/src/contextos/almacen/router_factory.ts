import { RouterFactoryAlmacenOlula } from '#/almacen/router_factory.ts';
import { rutaConPlugin } from '@olula/lib/plugins.tsx';
import { MaestroSubfamilia } from '#/almacen/subfamilia/maestro/MaestroSubfamilia.tsx';
import { MaestroComposicion } from '#/almacen/composicion/maestro/MaestroComposicion.tsx';
import { RegenerarMovimientos } from '#/almacen/regenera_movimientos/vistas/RegenerarMovimientos.tsx';
import { MaestroUnidadMedida } from '#/almacen/pesosmedidas/maestro/MaestroUnidadMedida.tsx';

const r = RouterFactoryAlmacenOlula.router;

export class RouterFactoryAlmacenCremaCafe {
    static router = {
        "almacen/articulo": r["almacen/articulo"],
        "almacen/stock": r["almacen/stock"],
        "almacen/inventario": r["almacen/inventario"],
        "almacen/informe/inventario_valorado": r["almacen/informe/inventario_valorado"],
        // T2.8: maestro de subfamilias, solo accesible si el plugin está activo.
        "almacen/subfamilia": rutaConPlugin("subfamilias", MaestroSubfamilia),
        // T2.7: maestro pesos/medidas, solo accesible si el plugin está activo.
        "almacen/pesosmedidas": rutaConPlugin("pesos_medidas", MaestroUnidadMedida),
        // T2.6: composiciones y regenerar movimientos, solo con el plugin `articulos_compuestos`.
        "almacen/composicion": rutaConPlugin("articulos_compuestos", MaestroComposicion),
        "almacen/regenera_movimientos": rutaConPlugin("articulos_compuestos", RegenerarMovimientos),
    };
}
