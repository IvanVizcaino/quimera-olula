import { ApiKey } from "../diseño.ts";

export type EstadoMaestroApiKey = "INICIAL" | "CREANDO" | "CREADA" | "REVOCANDO";

export type ContextoMaestroApiKey = {
    estado: EstadoMaestroApiKey;
    /** null mientras carga. */
    claves: ApiKey[] | null;
    /** Valor de la clave recién creada; solo vive mientras se enseña (estado CREADA). */
    claveNueva: string | null;
    claveARevocar: ApiKey | null;
};
