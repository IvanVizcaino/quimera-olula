import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { PeriodoIva } from "../diseño.ts";
import { getPeriodoIva } from "../infraestructura.ts";
import { ContextoPeriodoIva, EstadoPeriodoIva } from "./diseño.ts";

type ProcesarPeriodoIva = ProcesarContexto<EstadoPeriodoIva, ContextoPeriodoIva>;

export const periodoIvaVacioDetalle = (): PeriodoIva => ({
    id: "",
    impuestoId: "",
    fechaDesde: null,
    fechaHasta: null,
    iva: 0,
    recargo: 0,
});

export const metaPeriodoIva: MetaModelo<PeriodoIva> = {
    campos: {
        iva: { requerido: true },
        recargo: { requerido: true },
    },
};

export const cargarContexto: ProcesarPeriodoIva = async (contexto, payload) => {
    const id = payload as string;
    if (!id) {
        const vacio = periodoIvaVacioDetalle();
        return { ...contexto, estado: "INICIAL", periodo: vacio, periodoInicial: vacio };
    }
    const periodo = await getPeriodoIva(id);
    return { ...contexto, estado: "Editando", periodo, periodoInicial: periodo };
};

export const refrescarPeriodoIva: ProcesarPeriodoIva = async (contexto) => {
    const periodo = await getPeriodoIva(contexto.periodo.id);
    return [
        { ...contexto, periodo },
        [["periodo_cambiado", periodo]],
    ];
};

export const cancelarEdicion: ProcesarPeriodoIva = async (ctx) => ({
    ...ctx,
    periodo: ctx.periodoInicial,
});
