import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/** Eneboo `co_gruposepigrafes`: nivel superior del plan contable, del que
 * cuelgan los epígrafes. El código es único dentro de su ejercicio. */
export interface GrupoEpigrafe extends Entidad {
    id: string;
    codigo: string;
    descripcion: string;
    ejercicioId: string;
}

export type GetGruposEpigrafes = (
    criteria: Criteria
) => RespuestaLista<GrupoEpigrafe>;
export type GetGrupoEpigrafe = (id: string) => Promise<GrupoEpigrafe>;

export interface NuevoGrupoEpigrafe extends Modelo {
    codigo: string;
    descripcion: string;
    ejercicioId: string;
}

export type PostGrupoEpigrafe = (
    nuevo: NuevoGrupoEpigrafe
) => Promise<string>;

export type CambiosGrupoEpigrafe = Partial<
    Pick<GrupoEpigrafe, "codigo" | "descripcion">
>;

export type PatchGrupoEpigrafe = (
    id: string,
    cambios: CambiosGrupoEpigrafe
) => Promise<void>;

export type DeleteGrupoEpigrafe = (id: string) => Promise<void>;
