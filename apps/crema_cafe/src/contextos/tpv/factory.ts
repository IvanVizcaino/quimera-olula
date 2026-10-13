import { FactoryTpvOlula } from '#/tpv/factory.ts';
import { menuTPV } from '#/tpv/menu.ts';
import { widgetsTpvHome } from '#/tpv/widgets.ts';
import type { TagArticulo } from '#/ventas/articulo/diseño.ts';
import type { RequisitoPlugin } from '@olula/lib/plugins.tsx';

/** CC-02: el buscador de artículos del TPV muestra primero la descripción y luego la referencia. */
export const formatoOpcionArticuloCremaCafe = (a: TagArticulo) => `${a.descripcion} - ${a.id}`;

const pluginPuntosTpv: RequisitoPlugin = "puntos_tpv";
const pluginValesTpv: RequisitoPlugin = "vales_tpv";

export class FactoryTpvCremaCafe extends FactoryTpvOlula {
    static articulo_formatoOpcion = formatoOpcionArticuloCremaCafe;

    // T7.5 + T7.6: tarjetas de puntos y vales condicionados a sus plugins.
    static override menu = {
        ...menuTPV,
        "TPV/Tarjetas de Puntos": { url: "/tpv/tarjeta_puntos", regla: "tpv.tarjeta_puntos.leer", plugin: pluginPuntosTpv },
        "TPV/Vales": { url: "/tpv/vale", regla: "tpv.vale.leer", plugin: pluginValesTpv },
    };

    static widgets = widgetsTpvHome;
}
