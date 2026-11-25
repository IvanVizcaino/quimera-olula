import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { useEffect, useState } from "react";
import { formatearCantidad } from "../../orden/dominio.ts";
import { etiquetaEstadoTarea } from "../../tarea/dominio.ts";
import { TareaTerminal } from "../diseño.ts";
import { getTareasTerminal } from "../infraestructura.ts";

/** Tareas pendientes, en curso y en pausa (del centro del puesto, si lo hay). Pulsar una la lee. */
export const ListaTareasTerminal = ({
    centroId,
    version,
    actual,
    onElegir,
}: {
    centroId: string;
    version: number;
    actual: string | null;
    onElegir: (id: string) => void;
}) => {
    const [tareas, setTareas] = useState<TareaTerminal[] | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let vigente = true;
        getTareasTerminal(centroId || null)
            .then((r) => {
                if (!vigente) return;
                setTareas(r.datos);
                setError("");
            })
            .catch(() => vigente && setError("No se pueden leer las tareas"));
        return () => {
            vigente = false;
        };
    }, [centroId, version]);

    return (
        <aside className="ListaTareasTerminal" aria-label="Tareas pendientes y en curso">
            <h3>Tareas{centroId ? ` de ${centroId}` : ""}</h3>
            {error && <p className="nota-consumos">{error}</p>}
            {tareas?.length === 0 && <p className="nota-consumos">No hay tareas pendientes</p>}
            <ul>
                {tareas?.map((t) => (
                    <li key={t.id}>
                        <button
                            type="button"
                            className={`tarea-lista${actual === t.id ? " actual" : ""}`}
                            onClick={() => onElegir(t.id)}
                        >
                            <span className="codigo-tarea">{t.id}</span>
                            <EtiquetaEstado {...etiquetaEstadoTarea(t.estado)} />
                            <span className="descripcion-tarea">{t.descripcion || t.codigo}</span>
                            <span className="nota-consumos">
                                {t.ordenId} · {t.articuloId} · {formatearCantidad(t.cantidadHecha)}/{formatearCantidad(t.cantidad)}
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </aside>
    );
};
