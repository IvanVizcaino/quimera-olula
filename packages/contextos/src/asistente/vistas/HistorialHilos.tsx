import { useEffect, useState } from "react";
import { IconMessageCircle, IconTrash } from "@tabler/icons-react";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { borrarHilo, listarHilos } from "#/asistente/infraestructura.ts";
import type { HiloIa } from "#/asistente/diseño.ts";
import "./HistorialHilos.css";

interface Props {
    threadIdActivo: string | null;
    onSeleccionar: (threadId: string) => void;
    /** Se invoca tras borrar con éxito el hilo que estaba activo — el padre debe
     * limpiar la conversación en curso (p. ej. iniciar una nueva), ya que su
     * checkpointer/historial ha dejado de existir en el servidor. */
    onHiloActivoBorrado: () => void;
}

export function HistorialHilos({ threadIdActivo, onSeleccionar, onHiloActivoBorrado }: Props) {
    const [hilos, setHilos] = useState<HiloIa[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hiloABorrar, setHiloABorrar] = useState<HiloIa | null>(null);

    useEffect(() => {
        let cancelado = false;
        listarHilos()
            .then(resultado => { if (!cancelado) setHilos(resultado); })
            .catch(() => { if (!cancelado) setError("No se pudo cargar el historial de conversaciones."); });
        return () => { cancelado = true; };
    }, []);

    const confirmarBorrado = async () => {
        if (!hiloABorrar) return;
        await borrarHilo(hiloABorrar.threadId);
        setHilos(prev => (prev ?? []).filter(h => h.threadId !== hiloABorrar.threadId));
        if (hiloABorrar.threadId === threadIdActivo) onHiloActivoBorrado();
        setHiloABorrar(null);
    };

    if (error) return <p className="asistente-historial__estado">{error}</p>;
    if (hilos === null) return <p className="asistente-historial__estado">Cargando conversaciones…</p>;
    if (hilos.length === 0) return <p className="asistente-historial__estado">Todavía no tienes conversaciones guardadas.</p>;

    return (
        <>
            <ul className="asistente-historial__lista">
                {hilos.map(hilo => (
                    <li key={hilo.threadId} className="asistente-historial__fila">
                        <button
                            type="button"
                            className={
                                "asistente-historial__item" +
                                (hilo.threadId === threadIdActivo ? " asistente-historial__item--activo" : "")
                            }
                            onClick={() => onSeleccionar(hilo.threadId)}
                        >
                            <IconMessageCircle size={15} />
                            <span className="asistente-historial__titulo">{hilo.titulo}</span>
                        </button>
                        <button
                            type="button"
                            aria-label="Borrar conversación"
                            title="Borrar conversación"
                            className="asistente-historial__borrar"
                            onClick={() => setHiloABorrar(hilo)}
                        >
                            <IconTrash size={15} />
                        </button>
                    </li>
                ))}
            </ul>
            <QModalConfirmacion
                nombre="confirmarBorrarHiloIa"
                abierto={hiloABorrar !== null}
                titulo="Borrar conversación"
                mensaje={
                    hiloABorrar
                        ? `¿Seguro que quieres borrar "${hiloABorrar.titulo}"? Esta acción no se puede deshacer.`
                        : undefined
                }
                onCerrar={() => setHiloABorrar(null)}
                onAceptar={confirmarBorrado}
                labelAceptar="Borrar"
            />
        </>
    );
}
