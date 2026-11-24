import { MaestroCentroCoste } from "./centro_coste/maestro/MaestroCentroCoste.tsx";
import { MaestroSeccion } from "./seccion/maestro/MaestroSeccion.tsx";
import { MaestroTipoCentroCoste } from "./tipo_centro_coste/maestro/MaestroTipoCentroCoste.tsx";

export class RouterFactoryProduccionOlula {
    static router = {
        "produccion/secciones": MaestroSeccion,
        "produccion/tipos_centro_coste": MaestroTipoCentroCoste,
        "produccion/centros_coste": MaestroCentroCoste,
    };
}
