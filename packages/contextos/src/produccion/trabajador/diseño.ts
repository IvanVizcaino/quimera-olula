import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/** Sección en la que puede trabajar un trabajador (`pr_seccionestrab`). */
export interface SeccionTrabajador {
    seccionId: string;
    descripcion: string;
    principal: boolean;
}

/** Trabajador de la planta (tabla `pr_trabajadores` de Eneboo). `id` es un código libre. */
export interface Trabajador extends Entidad {
    id: string;
    nombre: string;
    /** Sección principal (también la fila `principal` de `secciones`); vacía si no tiene. */
    seccionId: string;
    /** Descripción de la sección principal (solo lectura). */
    seccion: string;
    /** En el formulario llega como "true"/"false" (checkbox). */
    deBaja: boolean | string;
    /** Solo en el detalle; vacía en la lista. */
    secciones: SeccionTrabajador[];
}

export interface NuevoTrabajador extends Modelo {
    id: string;
    nombre: string;
    seccionId: string;
}

export type CambiosTrabajador = Partial<Pick<Trabajador, "nombre" | "seccionId" | "deBaja">>;

export type GetTrabajador = (id: string) => Promise<Trabajador>;
export type GetTrabajadores = (criteria: Criteria) => RespuestaLista<Trabajador>;
export type PostTrabajador = (nuevo: NuevoTrabajador) => Promise<string>;
export type PatchTrabajador = (id: string, cambios: CambiosTrabajador) => Promise<void>;
export type DeleteTrabajador = (id: string) => Promise<void>;
export type PostSeccionTrabajador = (id: string, seccionId: string, principal?: boolean) => Promise<void>;
export type DeleteSeccionTrabajador = (id: string, seccionId: string) => Promise<void>;
export type PatchSeccionPrincipal = (id: string, seccionId: string) => Promise<void>;
