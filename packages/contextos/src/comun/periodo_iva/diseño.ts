import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/** Periodo de tipos IVA/recargo por impuesto (ext. `cambio_iva`, tabla Eneboo `periodos`). */
export interface PeriodoIva extends Entidad {
    id: string;
    impuestoId: string;
    fechaDesde: Date | null;
    fechaHasta: Date | null;
    iva: number;
    recargo: number;
}

export interface NuevoPeriodoIva extends Modelo {
    impuestoId: string;
    fechaDesde?: Date | null;
    fechaHasta?: Date | null;
    iva: number;
    recargo: number;
}

export type CambiosPeriodoIva = Partial<
    Pick<PeriodoIva, "fechaDesde" | "fechaHasta" | "iva" | "recargo">
>;

export type GetPeriodoIva = (id: string) => Promise<PeriodoIva>;
export type GetPeriodosIva = (criteria: Criteria) => RespuestaLista<PeriodoIva>;
export type PostPeriodoIva = (nuevo: NuevoPeriodoIva) => Promise<string>;
export type PatchPeriodoIva = (id: string, cambios: CambiosPeriodoIva) => Promise<void>;
export type DeletePeriodoIva = (id: string) => Promise<void>;
