import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevoLibroFacturasEmitidas } from "../diseño.ts";

export const metaNuevoLibroFacturasEmitidas: MetaModelo<NuevoLibroFacturasEmitidas> =
    {
        campos: {
            descripcion: { requerido: true },
            ejercicioId: { requerido: true },
        },
    };

export { nuevoLibroFacturasEmitidasInicial } from "../dominio.ts";
