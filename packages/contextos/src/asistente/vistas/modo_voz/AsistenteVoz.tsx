import { useCallback, useEffect, useRef } from "react";
import {
    IconCheck, IconHelp, IconLoader2, IconMessageCircle, IconMicrophone, IconMicrophoneOff, IconPlayerStop,
    IconVolume, IconX,
} from "@tabler/icons-react";
import { FactoryObj } from "@olula/lib/factory_ctx.tsx";
import { solicitarAbrirHiloAsistente } from "@olula/lib/panel_lateral_events.ts";
import type { DetectorActivacion } from "@olula/lib/voz/detector_activacion.ts";
import { useBotonAuricular } from "@olula/lib/voz/useBotonAuricular.ts";
import { useNivelMicro } from "@olula/lib/voz/useNivelMicro.ts";
import { construirUrlNavegacion } from "#/asistente/dominio.ts";
import type { AccionNavegacion, EstadoModoVoz } from "#/asistente/diseño.ts";
import { useModoVoz } from "#/asistente/vistas/modo_voz/useModoVoz.ts";
import "./AsistenteVoz.css";

export interface AsistenteVozProps {
    navigate?: (url: string) => void;
}

const ETIQUETAS: Record<EstadoModoVoz, string> = {
    inactivo: "",
    en_espera: "Di «Oye Olula»",
    escuchando_orden: "Te escucho…",
    procesando: "Pensando…",
    respondiendo: "Respondiendo",
    confirmando: "¿Lo confirmo? Di «sí» o «no»",
    error: "No puedo escuchar",
};

const ESTADOS_CANCELABLES: EstadoModoVoz[] = ["escuchando_orden", "procesando", "respondiendo", "confirmando"];

/** Atajo para hablar sin frase de activación: Ctrl/Cmd + Mayús + Espacio. */
const esAtajoHablar = (e: KeyboardEvent) => (e.ctrlKey || e.metaKey) && e.shiftKey && e.code === "Space";
const ATAJO_HABLAR = "Ctrl+Mayús+Espacio";

/** Botón play/pausa del auricular para hablar — experimental (ver useBotonAuricular). */
const BOTON_AURICULAR = import.meta.env.VITE_ASISTENTE_VOZ_AURICULAR === "true";

// Mismo cálculo que useNivelMicro: el RMS de la voz rara vez pasa de 0.25.
const GANANCIA_NIVEL = 4;

// En móvil abrir el micro dos veces a la vez (reconocimiento + medidor de nivel) puede
// dejar al reconocedor sin audio ("audio-capture"): ahí el orbe no reacciona a la voz.
const MEDIR_NIVEL_MICRO = typeof navigator !== "undefined" && !/Android|iPhone|iPad/i.test(navigator.userAgent);

const IconoEstado = ({ estado }: { estado: EstadoModoVoz }) => {
    switch (estado) {
        case "procesando":
            return <IconLoader2 size={22} className="asistente-voz__girando" />;
        case "respondiendo":
            return <IconVolume size={22} />;
        case "confirmando":
            return <IconHelp size={22} />;
        case "error":
            return <IconMicrophoneOff size={22} />;
        default:
            return <IconMicrophone size={22} />;
    }
};

/**
 * Modo voz del asistente: orbe flotante visible en toda la app mientras el modo está
 * activo (se activa desde el micrófono de la cabecera). Reacciona al nivel del micro
 * para que se vea que está oyendo, y se despliega con la transcripción en vivo y la
 * respuesta al decir «Oye Olula».
 */
export const AsistenteVozBase = ({ navigate }: AsistenteVozProps) => {
    const orbeRef = useRef<HTMLButtonElement>(null);

    const onNavegar = useCallback(
        (accion: AccionNavegacion) => navigate?.(construirUrlNavegacion(accion)),
        [navigate]
    );
    // Modo audio: el nivel llega de la propia grabación de la orden.
    const onNivel = useCallback((nivel: number) => {
        orbeRef.current?.style.setProperty("--nivel-micro", Math.min(1, nivel * GANANCIA_NIVEL).toFixed(3));
    }, []);
    const detector = (FactoryObj.app.Asistente?.asistente_DetectorActivacion as DetectorActivacion | undefined) ?? null;

    const voz = useModoVoz({ onNavegar, onMostrarHilo: solicitarAbrirHiloAsistente, onNivel, detector });
    const { estado, cancelar, hablarAhora, modoCaptura } = voz;
    const modoAudio = modoCaptura === "audio";

    // En modo texto el micro está siempre abierto: se mide aparte para la animación.
    useNivelMicro(
        MEDIR_NIVEL_MICRO && !modoAudio && (estado === "en_espera" || estado === "escuchando_orden"),
        orbeRef,
    );

    useBotonAuricular(BOTON_AURICULAR && estado !== "inactivo" && !voz.pausado, hablarAhora);

    useEffect(() => {
        if (estado === "inactivo") return;
        const alPulsarAtajo = (e: KeyboardEvent) => {
            if (!esAtajoHablar(e)) return;
            e.preventDefault();
            hablarAhora();
        };
        window.addEventListener("keydown", alPulsarAtajo);
        return () => window.removeEventListener("keydown", alPulsarAtajo);
    }, [estado, hablarAhora]);

    useEffect(() => {
        if (!ESTADOS_CANCELABLES.includes(estado)) return;
        const alPulsarTecla = (e: KeyboardEvent) => {
            if (e.key === "Escape") cancelar();
        };
        window.addEventListener("keydown", alPulsarTecla);
        return () => window.removeEventListener("keydown", alPulsarTecla);
    }, [estado, cancelar]);

    if (estado === "inactivo") return null;

    const desplegado = estado !== "en_espera";
    const etiqueta =
        estado === "escuchando_orden" && modoAudio ? "Te escucho… (para sola al callar)"
        : estado === "confirmando" && modoAudio ? "¿Lo confirmo?"
        : ETIQUETAS[estado];
    const ayuda = modoAudio
        ? detector
            ? `Modo voz activo — di «Oye Olula», pulsa aquí o ${ATAJO_HABLAR} para hablar.`
            : `Modo voz activo — pulsa aquí o ${ATAJO_HABLAR} para hablar.`
        : `Modo voz activo — di «Oye Olula» (o pulsa aquí / ${ATAJO_HABLAR}) y tu petición.`;
    const texto =
        estado === "escuchando_orden" ? voz.textoEnVivo
        : estado === "procesando" ? voz.progreso ?? voz.orden
        : estado === "respondiendo" || estado === "confirmando" ? voz.respuesta
        : estado === "error" ? voz.error
        : null;

    return (
        <div className={`asistente-voz asistente-voz--${estado}${voz.pausado ? " asistente-voz--pausado" : ""}`}>
            <div className="asistente-voz__burbuja" role="status" aria-live="polite" hidden={!desplegado}>
                <p className="asistente-voz__etiqueta">{etiqueta}</p>
                {texto && <p className="asistente-voz__texto">{texto}</p>}
                <div className="asistente-voz__acciones">
                    {estado === "confirmando" && (
                        <>
                            <button type="button" className="asistente-voz__accion" onClick={() => voz.confirmar(false)}>
                                <IconX size={14} /> No
                            </button>
                            <button
                                type="button"
                                className="asistente-voz__accion asistente-voz__accion--principal"
                                onClick={() => voz.confirmar(true)}
                            >
                                <IconCheck size={14} /> Sí
                            </button>
                        </>
                    )}
                    {ESTADOS_CANCELABLES.includes(estado) && estado !== "confirmando" && (
                        <button type="button" className="asistente-voz__accion" onClick={cancelar}>
                            <IconPlayerStop size={14} /> Parar
                        </button>
                    )}
                    {estado === "error" && (
                        <>
                            <button type="button" className="asistente-voz__accion" onClick={voz.reintentar}>
                                Reintentar
                            </button>
                            <button type="button" className="asistente-voz__accion" onClick={voz.desactivar}>
                                Desactivar
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="asistente-voz__controles">
                <button
                    ref={orbeRef}
                    type="button"
                    className="asistente-voz__orbe"
                    aria-label="Hablar con el asistente"
                    aria-keyshortcuts="Control+Shift+Space"
                    title={
                        voz.pausado ? "Modo voz en pausa: otra pantalla está usando la voz"
                        : estado === "en_espera" ? ayuda
                        : undefined
                    }
                    onClick={hablarAhora}
                >
                    <span className="asistente-voz__halo" aria-hidden="true" />
                    <span className="asistente-voz__nucleo">
                        <IconoEstado estado={estado} />
                    </span>
                </button>
                {voz.threadId && (
                    <button
                        type="button"
                        className="asistente-voz__ver-chat"
                        aria-label="Ver el chat de voz"
                        title="Ver el chat de voz"
                        onClick={() => solicitarAbrirHiloAsistente(voz.threadId as string)}
                    >
                        <IconMessageCircle size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};
