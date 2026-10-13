import { MetaModelo } from "@olula/lib/dominio.ts";
import { CambiosPeriodoIva, NuevoPeriodoIva } from "./diseño.ts";

export const metaNuevoPeriodoIva: MetaModelo<NuevoPeriodoIva> = {
    campos: {
        impuestoId: { requerido: true },
        iva: { requerido: true },
        recargo: { requerido: true },
    },
};

export const metaCambiosPeriodoIva: MetaModelo<CambiosPeriodoIva> = {
    campos: {
        iva: { requerido: true },
        recargo: { requerido: true },
    },
};

export const periodoIvaVacio = (impuestoId: string): NuevoPeriodoIva => ({
    impuestoId,
    fechaDesde: null,
    fechaHasta: null,
    iva: 21,
    recargo: 0,
});

export const IMPUESTO_ID_DEFECTO = "GEN";
