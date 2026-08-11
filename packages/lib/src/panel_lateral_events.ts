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
