/**
 * Puente desacoplado (vía eventos de window) entre paneles laterales que viven en
 * paquetes/módulos distintos y no comparten un React Context común — p. ej. el menú de
 * usuario (packages/componentes, dentro de MenuProvider) y el panel lateral del
 * asistente (packages/contextos, montado fuera del árbol de Plantilla). Mismo patrón
 * que ya usa auth_storage_events.ts para notificar cambios de sesión.
 */

export const PANEL_LATERAL_TOGGLE_EVENT = "quimera:panel-lateral-toggle";
export const PANEL_LATERAL_ABIERTO_EVENT = "quimera:panel-lateral-abierto";

export const solicitarTogglePanelLateral = (panel: string) => {
    window.dispatchEvent(new CustomEvent<string>(PANEL_LATERAL_TOGGLE_EVENT, { detail: panel }));
};

export const notificarPanelLateralAbierto = (panel: string) => {
    window.dispatchEvent(new CustomEvent<string>(PANEL_LATERAL_ABIERTO_EVENT, { detail: panel }));
};

/** Pide al panel del asistente que se abra mostrando un hilo concreto (p. ej. el hilo
 * de voz, cuando una respuesta dada por voz trae tablas o tarjetas que solo se ven ahí). */
export const ASISTENTE_ABRIR_HILO_EVENT = "quimera:asistente-abrir-hilo";

export const solicitarAbrirHiloAsistente = (threadId: string) => {
    window.dispatchEvent(new CustomEvent<string>(ASISTENTE_ABRIR_HILO_EVENT, { detail: threadId }));
};

/** Pide al panel del asistente que se abra y envíe esta pregunta (p. ej. desde la
 * búsqueda rápida de la cabecera: "Preguntar a Olula"). */
export const ASISTENTE_PREGUNTAR_EVENT = "quimera:asistente-preguntar";

export const solicitarPreguntaAsistente = (pregunta: string) => {
    window.dispatchEvent(new CustomEvent<string>(ASISTENTE_PREGUNTAR_EVENT, { detail: pregunta }));
};
