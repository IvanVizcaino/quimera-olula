import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevoLibroDiario } from "../diseño.ts";

export const metaNuevoLibroDiario: MetaModelo<NuevoLibroDiario> = {
    campos: {
        descripcion: { requerido: true },
        ejercicioId: { requerido: true },
    },
};

export { nuevoLibroDiarioInicial } from "../dominio.ts";
