import { ResultadoLibroIva } from "#/contabilidad/comun/librosIva.ts";
import { LibroFacturasRecibidas } from "../diseño.ts";

export type EstadoDetalleLibroFacturasRecibidas =
    | "INICIAL"
    | "ABIERTO"
    | "BORRANDO";

export type ContextoDetalleLibroFacturasRecibidas = {
    estado: EstadoDetalleLibroFacturasRecibidas;
    informe: LibroFacturasRecibidas;
    /** `null` mientras no se ha calculado o tras cambiar los criterios. */
    resultado: ResultadoLibroIva | null;
};
