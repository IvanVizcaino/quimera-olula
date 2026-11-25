import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { useEffect, useState } from "react";
import { criteriaTodos } from "../comun/dominio.ts";
import { TiempoTarea } from "./diseño.ts";
import { getTiemposTipoCentro } from "./infraestructura.ts";
import { metaTablaTiempos } from "./maestro/diseño.ts";

const metaTabla = metaTablaTiempos.filter((c) => c.id !== "tipo_centro_id");
const criteria = { ...criteriaTodos, orden: ["codigo_tarea", "ASC"] };

/** Tiempos de tarea de un tipo de centro de coste (solo lectura; se editan en Tiempos de tarea). */
export const TiemposTipoCentro = ({ tipoCentroId }: { tipoCentroId: string }) => {
    const [tiempos, setTiempos] = useState<TiempoTarea[] | null>(null);

    useEffect(() => {
        if (!puede("produccion.tiempo_tarea")) return;
        getTiemposTipoCentro(tipoCentroId, criteria).then(({ datos }) => setTiempos(datos));
    }, [tipoCentroId]);

    if (!tiempos) return null;
    return (
        <div className="TiemposTipoCentro">
            {tiempos.length === 0
                ? <p>No hay tiempos de tareas para este tipo de centro.</p>
                : <QTabla<TiempoTarea> metaTabla={metaTabla} datos={tiempos} cargando={false} orden={[]} />}
            <p className="nota-tiempos">Se cambian en Producción &gt; Tiempos de tarea.</p>
        </div>
    );
};
