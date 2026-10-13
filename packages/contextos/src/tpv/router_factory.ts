import { MaestroAgenteTpv } from "./agente/maestro/MaestroAgenteTpv.tsx";
import { MaestroConDetalleArqueoTpv } from "./arqueo/Maestro/MaestroConDetalleArqueoTpv.tsx";
import { MaestroPuntoVentaTpv } from "./punto_de_venta/maestro/MaestroPuntoVentaTpv.tsx";
import { MaestroConDetalleVentaTpv } from "./venta/maestro/MaestroConDetalleVentaTpv.tsx";

export class RouterFactoryTpvOlula {
    static router = {
        "tpv/venta": MaestroConDetalleVentaTpv,
        "tpv/arqueo": MaestroConDetalleArqueoTpv,
        "tpv/agente": MaestroAgenteTpv,
        "tpv/punto_venta": MaestroPuntoVentaTpv,
    }
}
