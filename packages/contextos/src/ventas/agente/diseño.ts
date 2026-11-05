import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export interface Agente extends Entidad {
    id: string;
    nombre: string;
    nombre_pila: string;
    apellidos: string;
    id_fiscal: string;
    por_comision: number;
    telefono: string | null;
    email: string | null;
    direccion: string | null;
    ciudad: string | null;
    codpostal: string | null;
    provincia: string | null;
    usuario_id: string | null;
};

export interface NuevoAgente extends Modelo {
    nombre_pila: string;
    apellidos: string;
    id_fiscal: string;
    por_comision: number;
    telefono: string | null;
    email: string | null;
    direccion: string | null;
    ciudad: string | null;
    codpostal: string | null;
    provincia: string | null;
}

export type CambiosAgente = Partial<Omit<Agente, "id" | "nombre" | "usuario_id">>;

export type GetAgente = (id: string) => Promise<Agente>;

export type GetAgentesLista = (criteria: Criteria) => RespuestaLista<Agente>;

export type PostAgente = (nuevo: NuevoAgente) => Promise<string>;

export type PatchAgente = (id: string, cambios: CambiosAgente) => Promise<void>;
