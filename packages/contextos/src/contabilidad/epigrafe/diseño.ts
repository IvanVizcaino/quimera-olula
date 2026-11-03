import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/** Eneboo `co_epigrafes`: los subgrupos del plan contable. Cuelgan de un grupo
 * y pueden anidarse entre sí. */
export interface Epigrafe extends Entidad {
    id: string;
    codigo: string;
    descripcion: string;
    ejercicioId: string;
    grupoId: string;
    /** Código del grupo al que cuelga, que ya viene resuelto de la API. */
    codigoGrupo: string;
    padreId: string;
}

export type GetEpigrafes = (criteria: Criteria) => RespuestaLista<Epigrafe>;
export type GetEpigrafe = (id: string) => Promise<Epigrafe>;

export interface NuevoEpigrafe extends Modelo {
    codigo: string;
    descripcion: string;
    ejercicioId: string;
    grupoId: string;
}

export type PostEpigrafe = (nuevo: NuevoEpigrafe) => Promise<string>;

export type CambiosEpigrafe = Partial<
    Pick<Epigrafe, "codigo" | "descripcion" | "grupoId">
>;

export type PatchEpigrafe = (
    id: string,
    cambios: CambiosEpigrafe
) => Promise<void>;

export type DeleteEpigrafe = (id: string) => Promise<void>;
