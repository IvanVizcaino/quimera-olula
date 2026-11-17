import { metaFormularioLibroIva } from "#/contabilidad/comun/librosIva.ts";
import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevoLibroFacturasRecibidas } from "../diseño.ts";

export const metaNuevoLibroFacturasRecibidas: MetaModelo<NuevoLibroFacturasRecibidas> =
    metaFormularioLibroIva<NuevoLibroFacturasRecibidas>();

export { nuevoLibroFacturasRecibidasInicial } from "../dominio.ts";
