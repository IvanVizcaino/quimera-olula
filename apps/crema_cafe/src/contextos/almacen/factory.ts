import { FactoryAlmacenOlula } from '#/almacen/factory.ts';
import { menuAlmacen } from '#/almacen/menu.ts';
import type { MetaTabla } from '@olula/componentes/atomos/qtabla.tsx';
import type { Articulo } from '#/almacen/articulo/diseño.ts';
import { UsoArticulo } from '#/almacen/articulo/UsoArticulo.tsx';
import type { RequisitoPlugin } from '@olula/lib/plugins.tsx';

/**
 * CC-02 (Eneboo `ordenaColumnas`): descripción, referencia, impuesto, familia,
 * subfamilia, se compra, se vende. Compra/venta van en la columna "Uso".
 * Subfamilia solo con plugin `subfamilias` (API la rellena).
 */
export const metaTablaArticuloCremaCafe: MetaTabla<Articulo> = [
    { id: "descripcion", cabecera: "Descripción" },
    { id: "id", cabecera: "Referencia" },
    {
        id: "grupo_iva_producto_id",
        cabecera: "Impuesto",
        render: (a) => a.grupoIvaProductoId || "",
    },
    { id: "descripcion_familia", cabecera: "Familia", render: (a) => a.descripcionFamilia },
    {
        id: "descripcion_subfamilia",
        cabecera: "Subfamilia",
        render: (a) => a.descripcionSubfamilia ?? "",
    },
    { id: "uso", cabecera: "Uso", render: UsoArticulo },
];

const pluginSubfamilias: RequisitoPlugin = "subfamilias";
const pluginPesosMedidas: RequisitoPlugin = "pesos_medidas";
const pluginArticulosCompuestos: RequisitoPlugin = "articulos_compuestos";

export class FactoryAlmacenCremaCafe extends FactoryAlmacenOlula {
    static override articulo_metaTabla = metaTablaArticuloCremaCafe;

    // T1.1: artículos y stock. No existe pantalla de movimientos de stock en @olula/ctx.
    // T2.8: subfamilias condicionadas al plugin.
    static override menu = {
        "Almacén": menuAlmacen["Almacén"],
        "Almacén/Artículos": menuAlmacen["Almacén/Artículos"],
        "Almacén/Stock": menuAlmacen["Almacén/Stock"],
        "Almacén/Inventarios": menuAlmacen["Almacén/Inventarios"],
        "Almacén/Inventario valorado": {
            url: "/almacen/informe/inventario_valorado",
            regla: "almacen.inventario",
        },
        "Almacén/Subfamilias": { url: "/almacen/subfamilia", regla: "almacen.subfamilia", plugin: pluginSubfamilias },
        "Almacén/Unidades de medida": {
            url: "/almacen/pesosmedidas",
            regla: "almacen.pesosmedidas",
            plugin: pluginPesosMedidas,
        },
        // T2.6: ensamblado de kits (`composiciones`) y proceso de mantenimiento `acRegeneraMovimientos`.
        "Almacén/Composiciones": {
            url: "/almacen/composicion",
            regla: "almacen.composicion",
            plugin: pluginArticulosCompuestos,
        },
        "Almacén/Regenerar movimientos": {
            url: "/almacen/regenera_movimientos",
            regla: "almacen.regenera_movimientos",
            plugin: pluginArticulosCompuestos,
        },
    } as unknown as typeof FactoryAlmacenOlula.menu;
}
