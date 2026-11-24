import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { useMemo } from "react";
import { columnasTareas } from "../../tarea/ColumnasTarea.tsx";
import { TareaProduccion } from "../../tarea/diseño.ts";
import { OrdenProduccion } from "../diseño.ts";

/** Tareas del proceso de la orden con sus acciones; tras cada una se recarga la orden. */
export const TareasOrden = ({ orden, recargar }: { orden: OrdenProduccion; recargar: () => Promise<void> }) => {
    const metaTabla = useMemo(() => columnasTareas({ trasAccion: recargar }), [recargar]);
    if (orden.tareas.length === 0)
        return (
            <p className="nota-orden">
                {orden.lanzada
                    ? "La orden está lanzada, pero su proceso no tiene tareas activas."
                    : "La orden aún no tiene tareas: se generan al lanzarla a producción."}
            </p>
        );
    return (
        <div className="TareasOrden">
            <QTabla<TareaProduccion> metaTabla={metaTabla} datos={orden.tareas} cargando={false} orden={[]} />
        </div>
    );
};
