import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export interface ItemAsiento extends Entidad {
    id: string;
    numero: number;
    ejercicioId: string;
    fecha: Date;
    concepto: string;
    importe: number;
    manual: boolean;
    /** Documento de origen. Vacío en el asiento manual que no lo informa. */
    tipoDocumento: string;
    documento: string;
}

export interface PartidaAsiento extends Entidad {
    id: string;
    asientoId: string;
    subcuentaId: number;
    codigoSubcuenta: string;
    debe: number;
    haber: number;
    concepto: string;
    esIva?: boolean;
    baseImponible?: number | null;
    iva?: number | null;
    recargo?: number | null;
    grupoIvaProductoId?: string | null;
    grupoIvaNegocioId?: string | null;
    contrapartidaId?: number | null;
    casilla303?: string | null;
}

export interface Asiento extends ItemAsiento {
    partidas: PartidaAsiento[];
}

export interface PartidaManualInput extends Modelo {
    id?: string;
    subcuentaId: number;
    /** Código de subcuenta (solo UI del autocomplete; no se envía al API). */
    codigoSubcuenta?: string;
    debe: number;
    haber: number;
    concepto: string;
    /** Derivado de la subcuenta (cuenta especial IVASOP / IVAREP); solo UI, el
     * API lo vuelve a deducir y no se envía. */
    esIva?: boolean;
    baseImponible?: number;
    ivaPct?: number;
    recargo?: number;
    grupoIvaProductoId?: string;
    grupoIvaNegocioId?: string;
    contrapartidaId?: number;
    contrapartidaCodigo?: string;
    casilla303?: string;
}

export interface NuevoAsientoManual extends Modelo {
    ejercicioId: string;
    fecha: Date;
    concepto: string;
    tipoDocumento: string;
    documento: string;
    partidas: PartidaManualInput[];
}

export type CambiosAsientoManual = Partial<
    Pick<NuevoAsientoManual, "fecha" | "concepto" | "partidas" | "tipoDocumento" | "documento">
>;

export type GetAsiento = (id: string) => Promise<Asiento>;
export type GetAsientos = (criteria: Criteria) => RespuestaLista<ItemAsiento>;
export type GetPartidasAsiento = (criteria: Criteria) => RespuestaLista<PartidaAsiento>;
export type PostAsientoManual = (nuevo: NuevoAsientoManual) => Promise<{ id: string; numero: number }>;
export type PatchAsientoManual = (id: string, cambios: CambiosAsientoManual) => Promise<{ id: string; numero: number }>;
export type DeleteAsientoManual = (id: string) => Promise<void>;

export type ModoRenumeracionAsientos = "ejercicio_completo" | "rango";

export interface ResultadoRenumeracionAsientos {
    ejercicioId: string;
    totalAsientos: number;
    asientosRenumerados: number;
    ultimoNumero: number;
    siguienteSecuencia: number | null;
    modo: ModoRenumeracionAsientos;
}

export interface PayloadRenumerarAsientos {
    ejercicioId: string;
    fechaDesde?: string;
    fechaHasta?: string;
    numeroDesde?: number;
    numeroHasta?: number;
}

export type PatchRenumerarAsientos = (
    payload: PayloadRenumerarAsientos
) => Promise<ResultadoRenumeracionAsientos>;
