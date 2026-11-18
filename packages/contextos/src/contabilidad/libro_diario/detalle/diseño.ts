import { LibroDiario, ResultadoLibroDiario } from "../diseño.ts";

export type EstadoDetalleLibroDiario = "INICIAL" | "ABIERTO" | "BORRANDO";

export type ContextoDetalleLibroDiario = {
    estado: EstadoDetalleLibroDiario;
    informe: LibroDiario;
    /** `null` mientras no se ha calculado o tras cambiar los criterios. */
    resultado: ResultadoLibroDiario | null;
};
