import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export interface ClienteTenant extends Entidad {
    id: string;
    nombre: string;
    cadenaConexionCifrada: string;
    activo: boolean;
}

export interface NuevoClienteTenant extends Modelo {
    id: string;
    nombre: string;
    /** Cadena de conexión en claro (JSON). El backend la cifra antes de persistir. */
    cadenaConexion: string;
    activo: boolean;
}

/** Solo nombre y activo son editables en el detalle. La cadena se actualiza aparte. */
export type CambiosClienteTenant = { nombre?: string; activo?: boolean; cadenaConexion?: string };

export type GetClienteTenant = (id: string) => Promise<ClienteTenant>;
export type GetClientesTenant = (criteria: Criteria) => RespuestaLista<ClienteTenant>;
export type PostClienteTenant = (nuevo: NuevoClienteTenant) => Promise<string>;
export type PatchClienteTenant = (id: string, cambios: CambiosClienteTenant) => Promise<void>;
export type DeleteClienteTenant = (id: string) => Promise<void>;
