import { PaginaAsistente } from "#/asistente/vistas/PaginaAsistente.tsx";
import { MaestroConDetalleComunicacion } from "./comunicacion/maestro/MaestroConDetalleComunicacion.tsx";
import { MaestroConDetalleIaFlujo } from "./ia_flujo/maestro/MaestroConDetalleIaFlujo.tsx";
import { MaestroConDetalleIaMemoria } from "./ia_memoria/maestro/MaestroConDetalleIaMemoria.tsx";

export class RouterFactoryComunOlula {
    static router = {
        "comun/comunicacion": MaestroConDetalleComunicacion,
        "comun/comunicacion/:id": MaestroConDetalleComunicacion,
        "comun/asistente": PaginaAsistente,
        "comun/ia-memoria": MaestroConDetalleIaMemoria,
        "comun/ia-memoria/:id": MaestroConDetalleIaMemoria,
        "comun/ia-flujo": MaestroConDetalleIaFlujo,
        "comun/ia-flujo/:id": MaestroConDetalleIaFlujo,
    };
}
