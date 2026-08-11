// import { MaestroConDetalleIncidencia } from "./incidencia/maestro/MaestroConDetalleIncidencia.tsx";
import { MaestroIncidencias } from "./incidencia/maestro/MaestroIncidencias.tsx";

export class RouterFactoryCrmSanhigia {
    static router = {
        // "crm/incidencia": MaestroConDetalleIncidencia,
        "crm/incidencia": MaestroIncidencias,
    };
}
