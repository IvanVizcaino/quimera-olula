import { Criteria, Entidad } from "@olula/lib/diseño.ts";

export interface CabeceraMayor {
    subcuentaId: number;
    codigoSubcuenta: string;
    descripcionSubcuenta: string;
    saldoInicial: number;
    saldoFinal: number;
}

export interface LineaMayor extends Entidad {
    id: string;
    partidaId: number;
    asientoId: number;
    asientoNumero: number;
    fecha: Date;
    concepto: string;
    debe: number;
    haber: number;
    saldo: number;
}

export interface InformeMayor {
    cabecera: CabeceraMayor;
    lineas: LineaMayor[];
    total: number;
}

export interface FilaSumasSaldos extends Entidad {
    id: string;
    subcuentaId?: number;
    codigoSubcuenta: string;
    descripcionSubcuenta: string;
    codigoCuenta: string | null;
    descripcionCuenta: string | null;
    debePeriodo: number;
    haberPeriodo: number;
    saldoInicial: number;
    saldoDebe: number;
    saldoHaber: number;
    saldo?: number;
    numeroPartidas?: number;
}

export interface LineaDesgloseCuentasAnuales {
    codigo: string;
    descripcion: string;
    saldoActual: number;
    saldoAnterior: number;
}

export interface FilaBalance extends Entidad {
    id: string;
    codigoBalance: string;
    naturaleza: string;
    nivel1: string | null;
    descripcionBalance: string | null;
    codigoCuenta: string;
    descripcionCuenta: string;
    debe: number;
    haber: number;
    saldo: number;
    /** PGC 2008 (`plancontable=08`): saldo del ejercicio actual / anterior. */
    saldoActual?: number;
    saldoAnterior?: number;
    descripcion1?: string | null;
    descripcion2?: string | null;
    descripcion3?: string | null;
    descripcion4?: string | null;
    desglose?: LineaDesgloseCuentasAnuales[];
}

/** P&G / ingresos y gastos: misma forma que balance. */
export type FilaPyg = FilaBalance;

export interface FilaPatrimonio extends Entidad {
    id: string;
    etiqueta: string;
    valores: number[];
}

export interface InformePatrimonio {
    titulo: string;
    columnas: string[];
    datos: FilaPatrimonio[];
    total: number;
}

export interface LineaDiario extends Entidad {
    id: string;
    partidaId: number;
    asientoId: number;
    asientoNumero: number;
    fecha: Date;
    conceptoAsiento: string;
    codigoSubcuenta: string;
    concepto: string;
    debe: number;
    haber: number;
}

export type TipoInformeContableReport =
    | "mayor"
    | "sumas_saldos"
    | "balance"
    | "pyg"
    | "diario"
    | "ingresos_gastos"
    | "patrimonio"
    | "libro_facturas_emitidas"
    | "libro_facturas_recibidas"
    | "libro_facturas_recibidas_ccaja";

export interface FilaLibroFacturasIva extends Entidad {
    id: string;
    partidaId: number;
    fechaAsiento: Date;
    asientoNumero: number;
    codigoSerie: string | null;
    numeroFactura: string | null;
    codigoFactura: string | null;
    nombreTercero: string | null;
    codigoTercero: string | null;
    cifNif: string | null;
    codigoContrapartida: string | null;
    nombreContrapartida: string | null;
    baseImponible: number;
    cuotaIva: number;
    porcentajeIva: number;
    porcentajeRecargo: number;
    codImpuesto: string | null;
    codGrupoIvaNeg: string | null;
    tipoCalculo: string | null;
    documento: string | null;
}

export type GetInformeLibroFacturasIva = (
    criteria: Criteria
) => Promise<{ datos: FilaLibroFacturasIva[]; total: number }>;

export type GetInformeMayor = (criteria: Criteria) => Promise<InformeMayor>;
export type GetInformeSumasSaldos = (criteria: Criteria) => Promise<{ datos: FilaSumasSaldos[]; total: number }>;
export type GetInformeBalance = (criteria: Criteria) => Promise<{ datos: FilaBalance[]; total: number }>;

/** Recibo pagado de una factura acogida a criterio de caja (bloque «Recibos pagados» del informe). */
export interface ReciboPagadoLibroRecc {
    reciboId: number;
    codigo: string | null;
    formaPagoId: string | null;
    formaPago: string | null;
    fechaPago: Date | null;
    importe: number | null;
}

/** Una partida de IVA de factura recibida (Eneboo `co_i_facturasrec_*_ccaja`). */
export interface FilaLibroFacturasRecCcaja extends Entidad {
    id: string;
    partidaId: number;
    fechaAsiento: Date;
    asientoNumero: number;
    codigoSerie: string | null;
    numeroFactura: number | null;
    numeroFacturaProveedor: string | null;
    codigoFactura: string | null;
    codigoProveedor: string | null;
    nombreProveedor: string | null;
    cifNif: string | null;
    codigoSubcuenta: string | null;
    codigoContrapartida: string | null;
    baseImponible: number;
    cuotaIva: number;
    porcentajeIva: number;
    porcentajeRecargo: number;
    codImpuesto: string | null;
    codGrupoIvaNeg: string | null;
    tipoCalculo: string | null;
    codigoSubcuentaReversion: string | null;
    documento: string | null;
    criterioCaja: boolean;
    recibos: ReciboPagadoLibroRecc[];
}

export interface TotalesLibroRecc {
    base: number;
    cuota: number;
}

/** Línea de «Resumen de I.V.A.» (solo con `iva_nav`). */
export interface GrupoResumenIvaRecc {
    nombre: string;
    base: number;
    cuota: number;
    reversion: boolean;
    cuotaReversion: number;
}

/** Subtotal por grupo de negocio (opción `agrupar_iva_neg`). */
export interface TotalGrupoIvaNegRecc {
    codGrupoIvaNeg: string;
    base: number;
    cuota: number;
    cuotaReversion: number;
}

export interface LibroFacturasRecCcaja {
    datos: FilaLibroFacturasRecCcaja[];
    total: number;
    totales: TotalesLibroRecc;
    resumenIva: GrupoResumenIvaRecc[];
    totalesGrupoIvaNeg: TotalGrupoIvaNegRecc[];
}

/** Opciones del formulario Eneboo `co_i_facturasrec` (campos del `q`). */
export interface OpcionesLibroRecc {
    codigoSerie: string;
    conIva: boolean;
    codImpuesto: string;
    codGrupoIvaNeg: string;
    numeracionAuto: boolean;
    numDesde: number;
    agruparIvaNeg: boolean;
}

export type GetInformeLibroFacturasRecCcaja = (
    criteria: Criteria
) => Promise<LibroFacturasRecCcaja>;
export type GetInformePyg = (criteria: Criteria) => Promise<{ datos: FilaPyg[]; total: number }>;
export type GetInformeIngresosGastos = (criteria: Criteria) => Promise<{
    datos: FilaBalance[];
    total: number;
}>;
export type GetInformePatrimonio = (criteria: Criteria) => Promise<InformePatrimonio>;
export type GetInformeDiario = (criteria: Criteria) => Promise<{ datos: LineaDiario[]; total: number }>;
export type GetReportInformeContable = (
    tipo: TipoInformeContableReport,
    criteria: Criteria
) => Promise<Blob>;
