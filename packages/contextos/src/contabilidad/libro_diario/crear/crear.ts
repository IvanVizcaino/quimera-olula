import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevoLibroDiario } from "../diseño.ts";
import { metaFormularioLibroDiario } from "../dominio.ts";

export const metaNuevoLibroDiario: MetaModelo<NuevoLibroDiario> =
    metaFormularioLibroDiario<NuevoLibroDiario>();

export { nuevoLibroDiarioInicial } from "../dominio.ts";
