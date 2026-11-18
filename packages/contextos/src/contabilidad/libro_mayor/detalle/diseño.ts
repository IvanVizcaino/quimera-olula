import { LibroMayor, ResultadoLibroMayor } from "../diseño.ts";

export type EstadoDetalleLibroMayor = "INICIAL" | "ABIERTO" | "BORRANDO";

export type ContextoDetalleLibroMayor = {
    estado: EstadoDetalleLibroMayor;
    informe: LibroMayor;
    /** `null` mientras no se ha calculado o tras cambiar los criterios. */
    resultado: ResultadoLibroMayor | null;
};
