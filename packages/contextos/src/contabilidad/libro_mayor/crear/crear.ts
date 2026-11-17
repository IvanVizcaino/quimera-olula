import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevoLibroMayor } from "../diseño.ts";
import { metaFormularioLibroMayor } from "../dominio.ts";

export const metaNuevoLibroMayor: MetaModelo<NuevoLibroMayor> =
    metaFormularioLibroMayor<NuevoLibroMayor>();

export { nuevoLibroMayorInicial } from "../dominio.ts";
