import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/** Sección de la planta (tabla `pr_secciones` de Eneboo). */
export interface Seccion extends Entidad {
    id: string;
    descripcion: string;
}

export interface NuevaSeccion extends Modelo {
    id: string;
    descripcion: string;
}

export type CambiosSeccion = Partial<Pick<Seccion, "descripcion">>;

export type GetSeccion = (id: string) => Promise<Seccion>;
export type GetSecciones = (criteria: Criteria) => RespuestaLista<Seccion>;
export type PostSeccion = (nueva: NuevaSeccion) => Promise<string>;
export type PatchSeccion = (id: string, cambios: CambiosSeccion) => Promise<void>;
export type DeleteSeccion = (id: string) => Promise<void>;
