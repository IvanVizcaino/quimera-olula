import { Contexto } from "@olula/lib/diseño.ts";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Grupo } from "../diseño.ts";

export type EstadoMaestroGrupo = "LISTA" | "ALTA";

export type ContextoMaestroGrupo = Contexto<EstadoMaestroGrupo> & {
    grupos: ListaActivaEntidades<Grupo>;
};
