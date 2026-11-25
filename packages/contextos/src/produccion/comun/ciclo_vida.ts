import { RestAPI } from "@olula/lib/api/rest_api.ts";

/**
 * Ciclo de vida de un agregado del servidor (`GET /comun/ciclo_vida/<agregado>/<id>/acciones`):
 * su estado y qué comandos caben ahora. La web habilita los botones con esto en lugar de repetir
 * las reglas de estado del servidor.
 */
export interface AccionCicloVida {
    comando: string;
    cabe: boolean;
    /** Cuándo cabe o no según lo que cambie el comando (p. ej. «salvo si solo cambia …»). */
    condicion: string | null;
    /** Si no cabe, el mensaje del error con que fallaría. */
    motivo: string | null;
    /** Si el usuario tiene permiso; `null` si no se ha mirado. */
    permitido: boolean | null;
}

export interface AccionesCicloVida {
    estado: string;
    /** El estado en texto para personas. */
    etiqueta: string;
    acciones: AccionCicloVida[];
}

interface AccionesCicloVidaApi {
    estado: string;
    etiqueta: string;
    acciones: {
        comando: string;
        cabe: boolean;
        condicion?: string | null;
        motivo?: string | null;
        permitido?: boolean | null;
    }[];
}

export const accionesCicloVidaDesdeApi = (api: AccionesCicloVidaApi): AccionesCicloVida => ({
    estado: api.estado,
    etiqueta: api.etiqueta,
    acciones: (api.acciones ?? []).map((a) => ({
        comando: a.comando,
        cabe: !!a.cabe,
        condicion: a.condicion ?? null,
        motivo: a.motivo ?? null,
        permitido: a.permitido ?? null,
    })),
});

export const getAccionesCicloVida = (agregado: string, id: string): Promise<AccionesCicloVida> =>
    RestAPI.getItem<AccionesCicloVida, AccionesCicloVidaApi>(
        `/comun/ciclo_vida/${encodeURIComponent(agregado)}/${encodeURIComponent(id)}/acciones`,
        accionesCicloVidaDesdeApi,
    );

/** La acción del comando, si el ciclo de vida la declara. */
export const accionCicloVida = (acciones: AccionesCicloVida | null, comando: string): AccionCicloVida | undefined =>
    acciones?.acciones.find((a) => a.comando === comando);

/**
 * Si cabe lanzar `comando` ahora (estado y permiso). Sin acciones (aún no se han leído o no se
 * han podido leer) decide `porDefecto`.
 */
export const cabeAccion = (acciones: AccionesCicloVida | null, comando: string, porDefecto = false): boolean => {
    const accion = accionCicloVida(acciones, comando);
    if (!accion) return porDefecto;
    return accion.cabe && accion.permitido !== false;
};

/** Motivo para no poder lanzar `comando` (para el `title` de un botón deshabilitado). */
export const motivoAccion = (acciones: AccionesCicloVida | null, comando: string): string | undefined => {
    const accion = accionCicloVida(acciones, comando);
    if (!accion) return undefined;
    if (accion.permitido === false) return "No tiene permiso para esta acción";
    return accion.cabe ? undefined : (accion.motivo ?? undefined);
};
