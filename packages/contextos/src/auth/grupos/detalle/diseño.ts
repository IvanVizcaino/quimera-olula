import { Contexto } from "@olula/lib/diseño.ts";
import { CategoriaReglas, Grupo } from "../diseño.ts";

export type EstadoDetalleGrupo = "INICIAL" | "LISTA";

export type ContextoDetalleGrupo = Contexto<EstadoDetalleGrupo> & {
    grupoSeleccionado: Grupo | null;
    reglasOrganizadas: CategoriaReglas[];
    categoriasAbiertas: Record<string, boolean>;
    reglasAbiertas: Record<string, boolean>;
};
