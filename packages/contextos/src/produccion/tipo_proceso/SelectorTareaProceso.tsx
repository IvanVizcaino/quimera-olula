import { Criteria } from "@olula/lib/diseño.ts";
import { useCallback } from "react";
import { PropsSelectorMaestro, SelectorMaestro } from "../comun/componentes/SelectorMaestro.tsx";
import { criteriaTodos } from "../comun/dominio.ts";
import { opcionTareaProceso } from "./dominio.ts";
import { getTareasProceso } from "./infraestructura.ts";

const criteriaTareas = (tipoProcesoId?: string | null): Criteria => ({
    ...criteriaTodos,
    filtro: tipoProcesoId ? [["tipo_proceso_id", "=", tipoProcesoId]] : [],
    orden: [],
});

/**
 * Selector de una tarea de tipo de proceso (`pr_tipostareapro`), con el tipo de proceso, el código
 * y la descripción. Con `tipoProcesoId`, solo las de ese tipo. Necesita `produccion.tipo_proceso`.
 */
export const SelectorTareaProceso = (
    { label = "Tarea", nombre = "tareaProcesoId", tipoProcesoId, ...props }:
        PropsSelectorMaestro & { tipoProcesoId?: string | null }
) => {
    const cargar = useCallback(async () =>
        (await getTareasProceso(criteriaTareas(tipoProcesoId))).datos.map((t) => opcionTareaProceso(t, !tipoProcesoId)),
    [tipoProcesoId]);

    return <SelectorMaestro label={label} nombre={nombre} cargar={cargar} regla="produccion.tipo_proceso" {...props} />;
};
