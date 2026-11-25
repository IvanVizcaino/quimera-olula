import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext, useEffect, useState } from "react";
import { AccionesCicloVida } from "../../comun/ciclo_vida.ts";
import { SelectorTrabajador } from "../../trabajador/SelectorTrabajador.tsx";
import { AccionTarea, TareaProduccion } from "../diseño.ts";
import { ACCIONES_TAREA, motivoAccionTarea } from "../dominio.ts";
import { getAccionesTarea, postAccionTarea } from "../infraestructura.ts";
import "./AccionesTarea.css";

/**
 * Iniciar, Pausar, Terminar y Deshacer una tarea, habilitadas según su ciclo de vida (el motivo
 * del que no cabe, en el `title`). Al iniciar se puede indicar el trabajador; deshacer pide
 * confirmación. Tras cada acción (con error o sin él) se llama a `trasAccion` para recargar.
 */
export const AccionesTarea = ({
    tarea,
    trasAccion,
}: {
    tarea: TareaProduccion;
    trasAccion: () => Promise<void> | void;
}) => {
    const { intentar } = useContext(ContextoError);
    const [acciones, setAcciones] = useState<AccionesCicloVida | null>(null);
    const [confirmando, setConfirmando] = useState<"iniciar" | "deshacer" | null>(null);
    const [trabajadorId, setTrabajadorId] = useState("");
    const [ocupada, setOcupada] = useState(false);

    // Las acciones se leen de nuevo cuando cambia el estado. Una tarea OFF no admite ninguna.
    useEffect(() => {
        setAcciones(null);
        if (tarea.estado === "OFF") return;
        let vigente = true;
        getAccionesTarea(tarea.id)
            .then((a) => vigente && setAcciones(a))
            .catch(() => vigente && setAcciones(null));
        return () => {
            vigente = false;
        };
    }, [tarea.id, tarea.estado]);

    const ejecutar = async (accion: AccionTarea, trabajador?: string) => {
        setOcupada(true);
        try {
            await postAccionTarea(tarea.id, accion, trabajador);
        } finally {
            setOcupada(false);
            await trasAccion();
        }
    };

    const pulsar = async (accion: AccionTarea) => {
        if (accion === "iniciar" || accion === "deshacer") {
            setTrabajadorId(tarea.realizadaPor);
            setConfirmando(accion);
            return;
        }
        try {
            await intentar(() => ejecutar(accion));
        } catch {
            // `intentar` ya muestra el error (400/409) y se ha recargado.
        }
    };

    const confirmar = async () => {
        const accion = confirmando;
        if (!accion) return;
        try {
            await intentar(() => ejecutar(accion, accion === "iniciar" ? trabajadorId : undefined));
        } catch {
            // `intentar` ya muestra el error y se ha recargado.
        } finally {
            setConfirmando(null);
        }
    };

    return (
        <div className="AccionesTarea" onClick={(e) => e.stopPropagation()}>
            {ACCIONES_TAREA.map(({ accion, texto }) => {
                const motivo = motivoAccionTarea(tarea, acciones, accion);
                return (
                    <span key={accion} title={motivo}>
                        <QBoton
                            tamaño="pequeño"
                            variante="borde"
                            deshabilitado={!!motivo || ocupada}
                            props={{ "aria-label": `${texto} ${tarea.id}` }}
                            onClick={() => pulsar(accion)}
                        >
                            {texto}
                        </QBoton>
                    </span>
                );
            })}

            {confirmando === "iniciar" && (
                <QModalConfirmacion
                    nombre="iniciarTareaProduccion"
                    abierto={true}
                    titulo={`Iniciar tarea ${tarea.id}`}
                    mensaje={`${tarea.descripcion || tarea.codigo}. El trabajador es opcional.`}
                    labelAceptar="Iniciar"
                    onCerrar={() => setConfirmando(null)}
                    onAceptar={confirmar}
                >
                    <quimera-formulario>
                        <SelectorTrabajador
                            nombre="trabajadorId"
                            valor={trabajadorId}
                            descripcionActual={tarea.realizadaPor === trabajadorId ? tarea.trabajador : undefined}
                            onChange={(opcion) => setTrabajadorId(opcion?.valor ?? "")}
                        />
                    </quimera-formulario>
                </QModalConfirmacion>
            )}

            {confirmando === "deshacer" && (
                <QModalConfirmacion
                    nombre="deshacerTareaProduccion"
                    abierto={true}
                    titulo={`Deshacer tarea ${tarea.id}`}
                    mensaje={tarea.estado === "TERMINADA"
                        ? "La tarea vuelve a En curso: sus siguientes pendientes se desactivan y sus consumos vuelven a pendientes."
                        : "La tarea vuelve a Pendiente, sin inicio ni trabajador."}
                    labelAceptar="Deshacer"
                    onCerrar={() => setConfirmando(null)}
                    onAceptar={confirmar}
                />
            )}
        </div>
    );
};
