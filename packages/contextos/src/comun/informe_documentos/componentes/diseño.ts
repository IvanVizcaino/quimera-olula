import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { FichaInforme, ModoInforme, ResultadoInforme } from "../diseño.ts";

export type EstadoMaestroInforme = "INICIAL" | "CREANDO";

export type ContextoMaestroInforme = {
    estado: EstadoMaestroInforme;
    fichas: ListaActivaEntidades<FichaInforme>;
};

export type EstadoDetalleInforme = "INICIAL" | "ABIERTO" | "BORRANDO";

export type ContextoDetalleInforme = {
    estado: EstadoDetalleInforme;
    ficha: FichaInforme;
    /** `null` mientras no se ha calculado o tras cambiar los criterios. */
    resultado: ResultadoInforme | null;
    /** Lo último que se calculó: es lo que descarga «Descargar PDF». */
    modo: ModoInforme | null;
};
