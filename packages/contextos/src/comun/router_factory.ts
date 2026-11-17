import { PaginaAsistente } from "#/asistente/vistas/PaginaAsistente.tsx";
import { MaestroConDetalleComunicacion } from "./comunicacion/maestro/MaestroConDetalleComunicacion.tsx";
import { MaestroConDetalleCredencialExterna } from "./credencial_externa/maestro/MaestroConDetalleCredencialExterna.tsx";
import { PaginaDashboard, PaginaDashboardModulo } from "./dashboard/vistas/pagina/PaginaDashboard.tsx";
import { PaginaDashboards } from "./dashboard/vistas/PaginaDashboards.tsx";
import { MaestroConDetalleDivisa } from "./divisa/maestro/MaestroConDetalleDivisa.tsx";
import { PaginaHitlCola } from "./ia/hitl_cola/maestro/PaginaHitlCola.tsx";
import { MaestroConDetalleIaFlujo } from "./ia_flujo/maestro/MaestroConDetalleIaFlujo.tsx";
import { MaestroConDetalleIaMemoria } from "./ia_memoria/maestro/MaestroConDetalleIaMemoria.tsx";
import { MaestroConDetallePais } from "./pais/maestro/MaestroConDetallePais.tsx";
import { MaestroConDetalleProvincia } from "./provincia/maestro/MaestroConDetalleProvincia.tsx";
import { MaestroConDetalleIaTareaProgramada } from "./tarea_programada_ia/maestro/MaestroConDetalleIaTareaProgramada.tsx";
import { MaestroConDetalleZonaGeografica } from "./zona_geografica/maestro/MaestroConDetalleZonaGeografica.tsx";

export class RouterFactoryComunOlula {
        static router = {
                "comun/comunicacion": MaestroConDetalleComunicacion,
                "comun/comunicacion/:id": MaestroConDetalleComunicacion,
                "comun/asistente": PaginaAsistente,
                "comun/ia-memoria": MaestroConDetalleIaMemoria,
                "comun/ia-memoria/:id": MaestroConDetalleIaMemoria,
                "comun/ia-flujo": MaestroConDetalleIaFlujo,
                "comun/ia-flujo/:id": MaestroConDetalleIaFlujo,
                "comun/ia-tarea-programada": MaestroConDetalleIaTareaProgramada,
                "comun/ia-tarea-programada/:id": MaestroConDetalleIaTareaProgramada,
                "comun/credencial-externa": MaestroConDetalleCredencialExterna,
                "comun/credencial-externa/:id": MaestroConDetalleCredencialExterna,
                "comun/pais": MaestroConDetallePais,
                "comun/provincia": MaestroConDetalleProvincia,
                "comun/zona_geografica": MaestroConDetalleZonaGeografica,
                "comun/divisa": MaestroConDetalleDivisa,
                "comun/hitl-cola": PaginaHitlCola,
                "comun/dashboard": PaginaDashboards,
                "comun/dashboard/:id": PaginaDashboard,
                "dashboard/:clave": PaginaDashboardModulo,
        };
}
