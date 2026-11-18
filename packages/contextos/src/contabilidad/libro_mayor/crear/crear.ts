import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevoLibroMayor } from "../diseño.ts";

export const metaNuevoLibroMayor: MetaModelo<NuevoLibroMayor> = {
    campos: {
        descripcion: { requerido: true },
        ejercicioId: { requerido: true },
    },
};

export { nuevoLibroMayorInicial } from "../dominio.ts";
