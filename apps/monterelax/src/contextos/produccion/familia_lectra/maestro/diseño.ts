import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { FamiliaLectra } from "../diseño.ts";

export type EstadoMaestroFamiliasLectra = "INICIAL";

export type ContextoMaestroFamiliasLectra = {
    estado: EstadoMaestroFamiliasLectra;
    anidado: ListaActivaEntidades<FamiliaLectra>;
    corte: ListaActivaEntidades<FamiliaLectra>;
    suministro: ListaActivaEntidades<FamiliaLectra>;
};
