import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevaCuentasAnuales } from "../diseño.ts";

export const metaNuevaCuentasAnuales: MetaModelo<NuevaCuentasAnuales> = {
    campos: {
        descripcion: { requerido: true },
        tipo: { requerido: true },
        formato: { requerido: true },
        nivelDesglose: { requerido: true },
        ejercicioId: { requerido: true },
    },
};

export { nuevaCuentasAnualesInicial } from "../dominio.ts";
