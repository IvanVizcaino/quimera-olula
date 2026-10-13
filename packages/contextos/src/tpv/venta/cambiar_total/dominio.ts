import { MetaModelo } from "@olula/lib/dominio.js";
import { CambiarTotalVenta } from "./diseño.ts";

export const cambiarTotalVentaVacio: CambiarTotalVenta = {
    total: 0,
};

export const metaCambiarTotalVenta: MetaModelo<CambiarTotalVenta> = {
    campos: {
        total: { tipo: "decimal", requerido: true, decimales: 2, positivo: true },
    },
};
