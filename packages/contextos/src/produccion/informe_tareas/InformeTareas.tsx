import { MaestroInforme } from "#/comun/informe_documentos/componentes/MaestroInforme.tsx";
import "#/comun/informe_documentos/componentes/InformesDocumentos.css";
import "./InformeTareas.css";
import { INFORME_TAREAS } from "./pestañas.ts";

/** Producción > Informe de tareas: fichas de criterios y tareas con sus tiempos. */
export const InformeTareas = () => (
    <div className="InformesDocumentos InformeTareas">
        <h2>Informe de tareas</h2>
        <MaestroInforme pestaña={INFORME_TAREAS} />
    </div>
);
