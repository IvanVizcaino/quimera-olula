import { metaFormularioLibroIva } from "#/contabilidad/comun/librosIva.ts";
import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevoLibroFacturasEmitidas } from "../diseño.ts";

export const metaNuevoLibroFacturasEmitidas: MetaModelo<NuevoLibroFacturasEmitidas> =
    metaFormularioLibroIva<NuevoLibroFacturasEmitidas>();

export { nuevoLibroFacturasEmitidasInicial } from "../dominio.ts";
