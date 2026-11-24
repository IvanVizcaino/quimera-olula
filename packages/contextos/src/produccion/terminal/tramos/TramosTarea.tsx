import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { useEffect, useState } from "react";
import { formatearCantidad } from "../../orden/dominio.ts";
import { fechaHora } from "../../tarea/dominio.ts";
import { TareaTerminal, TramoTerminal } from "../diseño.ts";
import { textoError } from "../dominio.ts";
import { deleteTramo, getTramosTarea } from "../infraestructura.ts";

/** Estados en que se pueden editar y borrar los tramos (ciclo de vida de la tarea). */
const ESTADOS_EDITABLES = ["EN CURSO", "EN PAUSA", "TERMINADA"];

/**
 * Panel «Tramos» de la tarea leída: trabajador, cantidad, inicio y fin de cada tramo, con
 * Editar (reabre la pantalla de consumos precargada) y Borrar (con confirmación).
 */
export const TramosTarea = ({
    tarea,
    version,
    onEditar,
    onBorrado,
    onError,
}: {
    tarea: TareaTerminal;
    version: number;
    onEditar: (tramo: TramoTerminal) => void;
    onBorrado: (texto: string) => void;
    onError: (texto: string) => void;
}) => {
    const [tramos, setTramos] = useState<TramoTerminal[] | null>(null);
    const [borrando, setBorrando] = useState<TramoTerminal | null>(null);

    useEffect(() => {
        let vigente = true;
        setTramos(null);
        getTramosTarea(tarea.id)
            .then((t) => vigente && setTramos(t))
            .catch((e) => vigente && onError(textoError(e)));
        return () => {
            vigente = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tarea.id, version]);

    const editables = ESTADOS_EDITABLES.includes(tarea.estado);

    const borrar = async () => {
        const tramo = borrando;
        setBorrando(null);
        if (!tramo) return;
        try {
            await deleteTramo(tarea.id, tramo.id);
            onBorrado(`Tramo de ${formatearCantidad(tramo.cantidad)} de la tarea ${tarea.id} borrado`);
        } catch (e) {
            onError(textoError(e));
        }
    };

    return (
        <section className="TramosTarea" aria-label="Tramos de la tarea">
            <h3>Tramos de {tarea.id}</h3>
            {tramos === null ? (
                <p className="nota-consumos">Cargando…</p>
            ) : tramos.length === 0 ? (
                <p className="nota-consumos">Sin tramos declarados</p>
            ) : (
                <table className="tabla-tramos">
                    <thead>
                        <tr>
                            <th>Trabajador</th>
                            <th className="numero">Cantidad</th>
                            <th>Inicio</th>
                            <th>Fin</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {tramos.map((t) => (
                            <tr key={t.id} data-tramo={t.id}>
                                <td>{t.trabajadorId}{t.trabajador ? ` - ${t.trabajador}` : ""}</td>
                                <td className="numero">{formatearCantidad(t.cantidad)}</td>
                                <td>{fechaHora(t.diaInicio, t.tiempoInicio)}</td>
                                <td>{fechaHora(t.diaFin, t.tiempoFin)}</td>
                                <td className="acciones-tramo">
                                    <button type="button" className="boton-terminal secundario pequeno" disabled={!editables} onClick={() => onEditar(t)}>
                                        Editar
                                    </button>
                                    <button type="button" className="boton-terminal peligro pequeno" disabled={!editables} onClick={() => setBorrando(t)}>
                                        Borrar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {borrando && (
                <QModalConfirmacion
                    nombre="borrarTramoTerminal"
                    abierto={true}
                    titulo="Borrar tramo"
                    mensaje={`Se borra el tramo de ${formatearCantidad(borrando.cantidad)} (${borrando.trabajadorId}) con sus consumos y su producción.`}
                    onCerrar={() => setBorrando(null)}
                    onAceptar={borrar}
                />
            )}
        </section>
    );
};
