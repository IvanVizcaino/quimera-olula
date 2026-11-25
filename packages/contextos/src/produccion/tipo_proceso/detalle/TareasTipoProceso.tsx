import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext, useState } from "react";
import { FormTareaProceso, TareaProceso, TipoProceso } from "../diseño.ts";
import { esSecuencial, formDesdeTarea, marcasTarea, nuevaTareaProcesoVacia } from "../dominio.ts";
import { deleteTareaProceso, patchTareaProceso, postTareaProceso } from "../infraestructura.ts";
import { ModalTareaProceso } from "./ModalTareaProceso.tsx";

type Edicion = { titulo: string; tareaId: string | null; inicial: FormTareaProceso };

/** Tareas del tipo de proceso (`pr_tipostareapro`): añadir, cambiar y quitar. */
export const TareasTipoProceso = ({
    tipo,
    recargar,
}: {
    tipo: TipoProceso;
    recargar: () => Promise<void>;
}) => {
    const { intentar } = useContext(ContextoError);
    const [edicion, setEdicion] = useState<Edicion | null>(null);
    const secuencial = esSecuencial(tipo);

    const guardar = async (tarea: FormTareaProceso) => {
        if (!edicion) return;
        if (edicion.tareaId) await patchTareaProceso(tipo.id, edicion.tareaId, tarea);
        else await postTareaProceso(tipo.id, tarea);
        setEdicion(null);
        await recargar();
    };

    const quitar = (t: TareaProceso) => async () => {
        await intentar(() => deleteTareaProceso(tipo.id, t.id));
        await recargar();
    };

    const metaTabla: MetaTabla<TareaProceso> = [
        { id: "orden", cabecera: "Orden", ancho: "8%" },
        { id: "codigo", cabecera: "Código", estilo: "secundario" },
        { id: "descripcion", cabecera: "Descripción", estilo: "destacado" },
        { id: "tipoTarea", cabecera: "Tipo de tarea", render: (t) => t.tipoTarea || t.tipoTareaId },
        { id: "marcas", cabecera: "Marcas", render: marcasTarea },
        {
            id: "acciones",
            cabecera: "",
            render: (t) => (
                <div className="maestro-botones">
                    <QBoton variante="texto" tamaño="pequeño"
                        onClick={() => setEdicion({ titulo: `Cambiar tarea ${t.codigo}`, tareaId: t.id, inicial: formDesdeTarea(t) })}>
                        Editar
                    </QBoton>
                    <QBoton variante="texto" tamaño="pequeño" destructivo onClick={quitar(t)}>
                        Quitar
                    </QBoton>
                </div>
            ),
        },
    ];

    return (
        <div className="TareasTipoProceso">
            <div className="cabecera-rejilla">
                <h3>Tareas</h3>
                <QBoton onClick={() => setEdicion({ titulo: "Añadir tarea", tareaId: null, inicial: nuevaTareaProcesoVacia() })}>
                    Añadir tarea
                </QBoton>
            </div>
            <QTabla<TareaProceso> metaTabla={metaTabla} datos={tipo.tareas} cargando={false} orden={[]} />
            {edicion && (
                <ModalTareaProceso
                    titulo={edicion.titulo}
                    inicial={edicion.inicial}
                    secuencial={secuencial}
                    guardar={guardar}
                    cerrar={() => setEdicion(null)}
                />
            )}
        </div>
    );
};
