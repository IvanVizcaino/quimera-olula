import { Entidad, Modelo } from "@olula/lib/diseño.ts";

/**
 * Una clave de API del usuario que ha iniciado sesión. Sirve para que un agente
 * (Claude Code u otro cliente MCP) trabaje en Olula en su nombre y con sus permisos.
 * El valor de la clave no viaja nunca en el listado: solo se ve una vez, al crearla.
 */
export interface ApiKey extends Entidad {
    id: string;
    nombre: string;
    creada: Date | null;
    caduca: Date;
    caducada: boolean;
}

export interface NuevaApiKey extends Modelo {
    nombre: string;
    /** Duración en el formato del servidor: `7d`, `30d`... */
    expiracion: string;
}

export type GetMisApiKeys = () => Promise<ApiKey[]>;

/** Crea la clave y devuelve su valor, que el servidor no vuelve a enseñar. */
export type PostApiKey = (nueva: NuevaApiKey) => Promise<string>;

export type DeleteApiKey = (id: string) => Promise<void>;
