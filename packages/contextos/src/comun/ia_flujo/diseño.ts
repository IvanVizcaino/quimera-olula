import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/**
 * Interfaz principal de IaFlujo.
 * Representa un flujo de trabajo (los pasos a seguir) que el asistente
 * de IA del backend usa para guiar una tarea concreta.
 */
export interface IaFlujo extends Entidad {
    id: string;
    nombre: string;
    descripcionCorta: string;
    contenido: string;
    activo: boolean;
    creadoPor: string;
    creadoEn: Date;
    actualizadoEn: Date;
}

/**
 * Tipo para crear un nuevo flujo (sin campos calculados en el servidor).
 */
export interface NuevoIaFlujo extends Modelo {
    nombre: string;
    descripcionCorta: string;
    contenido: string;
}

/**
 * Tipo para cambiar un flujo existente.
 */
export type CambiosIaFlujo = Partial<IaFlujo>;

/**
 * Tipos de funciones para infraestructura (contratos)
 */
export type GetIaFlujo = (id: string) => Promise<IaFlujo>;

export type GetIaFlujos = (criteria: Criteria) => RespuestaLista<IaFlujo>;

export type PostIaFlujo = (nuevoIaFlujo: NuevoIaFlujo) => Promise<string>;

export type PatchIaFlujo = (id: string, cambios: CambiosIaFlujo) => Promise<void>;

export type DeleteIaFlujo = (id: string) => Promise<void>;
