import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useContext, useEffect, useState } from "react";
import { OpcionMaestro } from "../../comun/componentes/SelectorMaestro.tsx";
import { criteriaTodos } from "../../comun/dominio.ts";
import { nombreTarea, opcionTareaProceso } from "../../tipo_proceso/dominio.ts";
import { getTareasProceso } from "../../tipo_proceso/infraestructura.ts";
import { ComponenteFabricacion, FabricacionArticulo } from "../diseño.ts";
import { patchTareaComponente } from "../infraestructura.ts";

const sinTarea: OpcionMaestro = { valor: "", descripcion: "— Sin tarea —" };

/**
 * Componentes del artículo con la tarea del proceso en la que se consume cada uno
 * (`articuloscomp.idtipotareapro`). Se elige entre las tareas del tipo de proceso del artículo;
 * vacío quita la tarea. Para listarlas hace falta `produccion.tipo_proceso`.
 */
export const ComponentesFabricacion = ({
    articulo,
    recargar,
}: {
    articulo: FabricacionArticulo;
    recargar: () => Promise<void>;
}) => {
    const { intentar } = useContext(ContextoError);
    const [tareas, setTareas] = useState<OpcionMaestro[]>([]);
    const tipoProcesoId = articulo.tipoProcesoId;
    const conTareas = !!tipoProcesoId && puede("produccion.tipo_proceso");

    useEffect(() => {
        if (!conTareas) {
            setTareas([]);
            return;
        }
        getTareasProceso({ ...criteriaTodos, filtro: [["tipo_proceso_id", "=", tipoProcesoId]], orden: [] })
            .then(({ datos }) => setTareas(datos.map((t) => opcionTareaProceso(t, false))));
    }, [conTareas, tipoProcesoId]);

    const asignar = (c: ComponenteFabricacion) => async (opcion: { valor: string } | null) => {
        const tarea = opcion?.valor ?? "";
        if (tarea === c.tareaProcesoId) return;
        await intentar(() => patchTareaComponente(articulo.id, c.id, tarea || null));
        await recargar();
    };

    const opcionesDe = (c: ComponenteFabricacion): OpcionMaestro[] => [
        sinTarea,
        ...tareas,
        // La tarea actual puede ser de otro proceso (lo avisa el servidor): se muestra igualmente.
        ...(c.tareaProcesoId && !tareas.some((t) => t.valor === c.tareaProcesoId)
            ? [{ valor: c.tareaProcesoId, descripcion: `${nombreTarea(c.codigoTarea, c.tarea)} (otro proceso)` }]
            : []),
    ];

    const metaTabla: MetaTabla<ComponenteFabricacion> = [
        { id: "articuloId", cabecera: "Componente", estilo: "secundario", ancho: "18%" },
        { id: "descripcion", cabecera: "Descripción" },
        { id: "cantidad", cabecera: "Cantidad", tipo: "numero", ancho: "10%" },
        {
            id: "tarea",
            cabecera: "Se consume en",
            ancho: "40%",
            render: (c) => conTareas
                ? (
                    <QSelect
                        label=""
                        nombre={`tarea_${c.id}`}
                        valor={c.tareaProcesoId}
                        condensado
                        opciones={opcionesDe(c)}
                        onChange={asignar(c)}
                    />
                )
                : nombreTarea(c.codigoTarea, c.tarea),
        },
    ];

    return (
        <div className="ComponentesFabricacion">
            <h3>Componentes</h3>
            {articulo.componentes.length === 0
                ? <p>El artículo no tiene componentes.</p>
                : <>
                    {!tipoProcesoId && <p className="nota">Elija un tipo de proceso para indicar en qué tarea se consume cada componente.</p>}
                    <QTabla<ComponenteFabricacion> metaTabla={metaTabla} datos={articulo.componentes} cargando={false} orden={[]} />
                </>}
        </div>
    );
};
