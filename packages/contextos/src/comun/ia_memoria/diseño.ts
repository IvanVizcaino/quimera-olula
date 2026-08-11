import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/**
 * Interfaz principal de IaMemoria.
 * Representa un fragmento de contexto de negocio que el asistente de IA
 * del backend usa como memoria persistente.
 */
export interface IaMemoria extends Entidad {
    id: string;
    titulo: string;
    contenido: string;
    activo: boolean;
    creadoPor: string;
    creadoEn: Date;
    actualizadoEn: Date;
}

/**
 * Tipo para crear una nueva memoria (sin campos calculados en el servidor).
 */
export interface NuevaIaMemoria extends Modelo {
    titulo: string;
    contenido: string;
}

/**
 * Tipo para cambiar una memoria existente.
 */
export type CambiosIaMemoria = Partial<IaMemoria>;

/**
 * Tipos de funciones para infraestructura (contratos)
 */
export type GetIaMemoria = (id: string) => Promise<IaMemoria>;

export type GetIaMemorias = (criteria: Criteria) => RespuestaLista<IaMemoria>;

export type PostIaMemoria = (nuevaIaMemoria: NuevaIaMemoria) => Promise<string>;

export type PatchIaMemoria = (id: string, cambios: CambiosIaMemoria) => Promise<void>;

export type DeleteIaMemoria = (id: string) => Promise<void>;
