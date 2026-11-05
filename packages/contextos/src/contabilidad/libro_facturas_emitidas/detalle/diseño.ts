import { ResultadoLibroIva } from "#/contabilidad/comun/librosIva.ts";
import { LibroFacturasEmitidas } from "../diseño.ts";

export type EstadoDetalleLibroFacturasEmitidas =
    | "INICIAL"
    | "ABIERTO"
    | "BORRANDO";

export type ContextoDetalleLibroFacturasEmitidas = {
    estado: EstadoDetalleLibroFacturasEmitidas;
    informe: LibroFacturasEmitidas;
    /** `null` mientras no se ha calculado o tras cambiar los criterios. */
    resultado: ResultadoLibroIva | null;
};
