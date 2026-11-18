import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevoLibroFacturasRecibidas } from "../diseño.ts";

export const metaNuevoLibroFacturasRecibidas: MetaModelo<NuevoLibroFacturasRecibidas> =
    {
        campos: {
            descripcion: { requerido: true },
            ejercicioId: { requerido: true },
        },
    };

export { nuevoLibroFacturasRecibidasInicial } from "../dominio.ts";
