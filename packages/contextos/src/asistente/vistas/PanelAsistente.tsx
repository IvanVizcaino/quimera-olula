import { useCallback, useEffect, useState } from "react";
import { IconMessageChatbot, IconX } from "@tabler/icons-react";
import { FactoryObj } from "@olula/lib/factory_ctx.tsx";
import {
    PANEL_LATERAL_ABIERTO_EVENT,
    PANEL_LATERAL_TOGGLE_EVENT,
    notificarPanelLateralAbierto,
} from "@olula/lib/panel_lateral_events.ts";
import { construirUrlNavegacion } from "#/asistente/dominio.ts";
import type { AccionNavegacion } from "#/asistente/diseño.ts";
import { AsistenteRuntimeProvider } from "#/asistente/vistas/AsistenteRuntimeProvider.tsx";
import { Chat } from "#/asistente/vistas/Chat.tsx";
import { useSesionActiva } from "#/asistente/useSesionActiva.ts";
import "./PanelAsistente.css";

export interface PanelAsistenteProps {
    /** Ejecuta la navegación hacia la ruta/parámetros decididos por el asistente. */
    navigate?: (url: string) => void;
    /**
     * "flotante" (por defecto): botón flotante + drawer superpuesto, independiente del
     * resto del layout.
     * "lateral": panel fijo anclado bajo la cabecera, en la misma zona que el menú de
     * usuario — se abre/cierra desde el icono añadido en Cabecera.tsx (packages/componentes),
     * coordinados vía el bus de eventos de @olula/lib/panel_lateral_events.ts.
     */
    modo?: "flotante" | "lateral";
}

interface PanelAsistenteModoProps {
    navigate?: (url: string) => void;
}

const usePreparar = (navigate: ((url: string) => void) | undefined) => {
    const onAccionNavegacion = useCallback(
        (accion: AccionNavegacion) => {
            // No se cierra el panel: como el chat (AsistenteRuntimeProvider) solo vive
            // mientras el panel está abierto, cerrarlo lo desmontaba y se perdía toda la
            // conversación en cada navegación (tanto la decidida por el backend como la
            // de un click en una fila de Tabla).
            navigate?.(construirUrlNavegacion(accion));
        },
        [navigate]
    );
    return onAccionNavegacion;
};

const PanelAsistenteFlotante = ({ navigate }: PanelAsistenteModoProps) => {
    const [abierto, setAbierto] = useState(false);
    const onAccionNavegacion = usePreparar(navigate);

    return (
        <div className="asistente-panel">
            <button
                type="button"
                className="asistente-panel__fab"
                aria-label={abierto ? "Cerrar asistente" : "Abrir asistente"}
                onClick={() => setAbierto(v => !v)}
            >
                {abierto ? <IconX size={22} /> : <IconMessageChatbot size={22} />}
            </button>

            {abierto && (
                <div className="asistente-panel__drawer">
                    <AsistenteRuntimeProvider onAccionNavegacion={onAccionNavegacion}>
                        <Chat onCerrar={() => setAbierto(false)} />
                    </AsistenteRuntimeProvider>
                </div>
            )}
        </div>
    );
};

const PanelAsistenteLateral = ({ navigate }: PanelAsistenteModoProps) => {
    const [abierto, setAbierto] = useState(false);
    const onAccionNavegacion = usePreparar(navigate);

    useEffect(() => {
        const alSolicitarToggle = (e: Event) => {
            if ((e as CustomEvent<string>).detail === "asistente") setAbierto(v => !v);
        };
        const alAbrirOtroPanel = (e: Event) => {
            if ((e as CustomEvent<string>).detail === "usuario") setAbierto(false);
        };
        window.addEventListener(PANEL_LATERAL_TOGGLE_EVENT, alSolicitarToggle);
        window.addEventListener(PANEL_LATERAL_ABIERTO_EVENT, alAbrirOtroPanel);
        return () => {
            window.removeEventListener(PANEL_LATERAL_TOGGLE_EVENT, alSolicitarToggle);
            window.removeEventListener(PANEL_LATERAL_ABIERTO_EVENT, alAbrirOtroPanel);
        };
    }, []);

    useEffect(() => {
        if (abierto) notificarPanelLateralAbierto("asistente");
    }, [abierto]);

    return (
        <panel-asistente className={abierto ? "activo" : ""}>
            {abierto && (
                <AsistenteRuntimeProvider onAccionNavegacion={onAccionNavegacion}>
                    <Chat onCerrar={() => setAbierto(false)} />
                </AsistenteRuntimeProvider>
            )}
        </panel-asistente>
    );
};

export const PanelAsistenteBase = ({ navigate, modo = "flotante" }: PanelAsistenteProps) => {
    const sesionActiva = useSesionActiva();
    if (!sesionActiva) return null;

    return modo === "lateral"
        ? <PanelAsistenteLateral navigate={navigate} />
        : <PanelAsistenteFlotante navigate={navigate} />;
};

export const PanelAsistente = (props: PanelAsistenteProps) => {
    const Panel_ = (FactoryObj.app.Asistente?.asistente_PanelAsistente as typeof PanelAsistenteBase) ?? PanelAsistenteBase;
    return <Panel_ {...props} />;
};
