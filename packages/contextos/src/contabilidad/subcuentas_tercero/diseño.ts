import { Entidad } from "@olula/lib/diseño.ts";

/** De quién son las subcuentas: co_subcuentascli o co_subcuentasprov. */
export type TipoTercero = "cliente" | "proveedor";

/** Una fila de «Subcuentas por ejercicio» de la pestaña Contabilidad. */
export interface SubcuentaTercero extends Entidad {
    id: string;
    ejercicioId: string;
    subcuentaId: string;
    codigoSubcuenta: string;
    descripcion: string;
    saldo: number;
}

/** Partida de la subcuenta elegida (co_partidasmayor de Eneboo). */
export interface PartidaSubcuenta extends Entidad {
    id: string;
    asientoId: string;
    numeroAsiento: number;
    fecha: Date;
    concepto: string;
    debe: number;
    haber: number;
    /** Saldo acumulado (debe - haber) hasta esta partida. */
    saldo: number;
}

export type GetSubcuentasTercero = (
    tipo: TipoTercero,
    terceroId: string
) => Promise<SubcuentaTercero[]>;

export type GetPartidasSubcuenta = (
    subcuentaId: string
) => Promise<PartidaSubcuenta[]>;
