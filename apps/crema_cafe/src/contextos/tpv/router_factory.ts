import { RouterFactoryTpvOlula } from '#/tpv/router_factory.ts';
import { rutaConPlugin } from '@olula/lib/plugins.tsx';
import { MaestroTarjetaPuntos } from '#/tpv/tarjeta_puntos/maestro/MaestroTarjetaPuntos.tsx';
import { MaestroValesTpv } from '#/tpv/vale/maestro/MaestroValesTpv.tsx';

const r = RouterFactoryTpvOlula.router;

export class RouterFactoryTpvCremaCafe {
    // T7.5: tarjetas de puntos (solo con plugin puntos_tpv activo).
    // T7.6: vales consulta/anular (solo con plugin vales_tpv activo).
    static router = {
        ...r,
        "tpv/tarjeta_puntos": rutaConPlugin("puntos_tpv", MaestroTarjetaPuntos),
        "tpv/vale": rutaConPlugin("vales_tpv", MaestroValesTpv),
    };
}
