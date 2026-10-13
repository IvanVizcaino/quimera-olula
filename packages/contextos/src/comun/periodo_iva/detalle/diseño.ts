import { PeriodoIva } from "../diseño.ts";

export type EstadoPeriodoIva = "INICIAL" | "Editando" | "Borrando";

export type ContextoPeriodoIva = {
    estado: EstadoPeriodoIva;
    periodo: PeriodoIva;
    periodoInicial: PeriodoIva;
};
