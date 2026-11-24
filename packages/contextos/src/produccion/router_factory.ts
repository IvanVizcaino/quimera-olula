import { CalendarioProduccion } from "./calendario/maestro/CalendarioProduccion.tsx";
import { MaestroCentroCoste } from "./centro_coste/maestro/MaestroCentroCoste.tsx";
import { ConfigProduccion } from "./config/maestro/ConfigProduccion.tsx";
import { MaestroHorario } from "./horario/maestro/MaestroHorario.tsx";
import { MaestroSeccion } from "./seccion/maestro/MaestroSeccion.tsx";
import { MaestroTipoProceso } from "./tipo_proceso/maestro/MaestroTipoProceso.tsx";
import { MaestroTipoTarea } from "./tipo_tarea/maestro/MaestroTipoTarea.tsx";
import { MaestroTipoCentroCoste } from "./tipo_centro_coste/maestro/MaestroTipoCentroCoste.tsx";
import { MaestroTrabajador } from "./trabajador/maestro/MaestroTrabajador.tsx";

export class RouterFactoryProduccionOlula {
    static router = {
        "produccion/secciones": MaestroSeccion,
        "produccion/trabajadores": MaestroTrabajador,
        "produccion/tipos_centro_coste": MaestroTipoCentroCoste,
        "produccion/centros_coste": MaestroCentroCoste,
        "produccion/horarios": MaestroHorario,
        "produccion/calendario": CalendarioProduccion,
        "produccion/tipos_tarea": MaestroTipoTarea,
        "produccion/tipos_proceso": MaestroTipoProceso,
        "produccion/config": ConfigProduccion,
    };
}
