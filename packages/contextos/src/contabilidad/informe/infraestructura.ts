import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaAQueryString } from "@olula/lib/infraestructura.ts";
import ApiUrls from "#/contabilidad/comun/urls.ts";
import {
    CabeceraMayor,
    FilaBalance,
    FilaPyg,
    FilaPatrimonio,
    FilaSumasSaldos,
    FilaLibroFacturasIva,
    FilaLibroFacturasRecCcaja,
    LibroFacturasRecCcaja,
    GetInformeBalance,
    GetInformeDiario,
    GetInformeIngresosGastos,
    GetInformeLibroFacturasIva,
    GetInformeLibroFacturasRecCcaja,
    GetInformeMayor,
    GetInformePatrimonio,
    GetInformePyg,
    GetInformeSumasSaldos,
    GetReportInformeContable,
    InformeMayor,
    InformePatrimonio,
    LineaDiario,
    LineaMayor,
    TipoInformeContableReport,
} from "./diseño.ts";

const urls = new ApiUrls();

interface CabeceraMayorApi {
    subcuenta_id: number;
    codigo_subcuenta: string;
    descripcion_subcuenta: string;
    saldo_inicial: number;
    saldo_final: number;
}

interface LineaMayorApi {
    partida_id: number;
    asiento_id: number;
    asiento_numero: number;
    fecha: string;
    concepto: string;
    debe: number;
    haber: number;
    saldo: number;
}

interface InformeMayorDatosApi {
    cabecera: CabeceraMayorApi;
    lineas: LineaMayorApi[];
    total: number;
}

interface FilaSumasSaldosApi {
    subcuenta_id?: number;
    codigo_subcuenta: string;
    descripcion_subcuenta: string;
    codigo_cuenta: string | null;
    descripcion_cuenta: string | null;
    debe_periodo: number;
    haber_periodo: number;
    saldo_inicial: number;
    saldo_debe: number;
    saldo_haber: number;
    saldo?: number;
    numero_partidas?: number;
}

interface LineaDesgloseApi {
    codigo: string;
    descripcion: string;
    saldo_actual: number;
    saldo_anterior: number;
}

interface FilaBalanceApi {
    codigo_balance: string;
    naturaleza: string;
    nivel1: string | null;
    descripcion_balance: string | null;
    codigo_cuenta: string;
    descripcion_cuenta: string;
    debe: number;
    haber: number;
    saldo: number;
    saldo_actual?: number;
    saldo_anterior?: number;
    descripcion1?: string | null;
    descripcion2?: string | null;
    descripcion3?: string | null;
    descripcion4?: string | null;
    desglose?: LineaDesgloseApi[];
}

interface InformePatrimonioApi {
    titulo: string;
    columnas: string[];
    datos: { etiqueta: string; valores: number[] }[];
    total: number;
}

interface LineaDiarioApi {
    partida_id: number;
    asiento_id: number;
    asiento_numero: number;
    fecha: string;
    concepto_asiento: string;
    codigo_subcuenta: string;
    concepto: string;
    debe: number;
    haber: number;
}

const fechaDesdeApi = (fecha: string): Date => new Date(`${fecha}T12:00:00`);

export const cabeceraMayorDesdeApi = (api: CabeceraMayorApi): CabeceraMayor => ({
    subcuentaId: api.subcuenta_id,
    codigoSubcuenta: api.codigo_subcuenta,
    descripcionSubcuenta: api.descripcion_subcuenta,
    saldoInicial: api.saldo_inicial,
    saldoFinal: api.saldo_final,
});

export const lineaMayorDesdeApi = (api: LineaMayorApi): LineaMayor => ({
    id: String(api.partida_id),
    partidaId: api.partida_id,
    asientoId: api.asiento_id,
    asientoNumero: api.asiento_numero,
    fecha: fechaDesdeApi(api.fecha),
    concepto: api.concepto ?? "",
    debe: api.debe,
    haber: api.haber,
    saldo: api.saldo,
});

export const informeMayorDesdeApi = (api: InformeMayorDatosApi): InformeMayor => ({
    cabecera: cabeceraMayorDesdeApi(api.cabecera),
    lineas: api.lineas.map(lineaMayorDesdeApi),
    total: api.total,
});

export const filaSumasSaldosDesdeApi = (api: FilaSumasSaldosApi): FilaSumasSaldos => ({
    id: api.subcuenta_id != null ? String(api.subcuenta_id) : api.codigo_subcuenta,
    subcuentaId: api.subcuenta_id,
    codigoSubcuenta: api.codigo_subcuenta,
    descripcionSubcuenta: api.descripcion_subcuenta,
    codigoCuenta: api.codigo_cuenta,
    descripcionCuenta: api.descripcion_cuenta,
    debePeriodo: api.debe_periodo,
    haberPeriodo: api.haber_periodo,
    saldoInicial: api.saldo_inicial,
    saldoDebe: api.saldo_debe,
    saldoHaber: api.saldo_haber,
    saldo: api.saldo,
    numeroPartidas: api.numero_partidas,
});

export const filaBalanceDesdeApi = (api: FilaBalanceApi): FilaBalance => ({
    id: `${api.codigo_balance}-${api.codigo_cuenta}`,
    codigoBalance: api.codigo_balance,
    naturaleza: api.naturaleza,
    nivel1: api.nivel1,
    descripcionBalance: api.descripcion_balance,
    codigoCuenta: api.codigo_cuenta,
    descripcionCuenta: api.descripcion_cuenta,
    debe: api.debe,
    haber: api.haber,
    saldo: api.saldo_actual ?? api.saldo,
    saldoActual: api.saldo_actual,
    saldoAnterior: api.saldo_anterior,
    descripcion1: api.descripcion1,
    descripcion2: api.descripcion2,
    descripcion3: api.descripcion3,
    descripcion4: api.descripcion4,
    desglose: api.desglose?.map((d) => ({
        codigo: d.codigo,
        descripcion: d.descripcion,
        saldoActual: d.saldo_actual,
        saldoAnterior: d.saldo_anterior,
    })),
});

export const filaPygDesdeApi = (api: FilaBalanceApi): FilaPyg => filaBalanceDesdeApi(api);

export const informePatrimonioDesdeApi = (api: InformePatrimonioApi): InformePatrimonio => ({
    titulo: api.titulo,
    columnas: api.columnas,
    datos: api.datos.map(
        (f, i): FilaPatrimonio => ({
            id: String(i),
            etiqueta: f.etiqueta,
            valores: f.valores,
        })
    ),
    total: api.total,
});

export const lineaDiarioDesdeApi = (api: LineaDiarioApi): LineaDiario => ({
    id: String(api.partida_id),
    partidaId: api.partida_id,
    asientoId: api.asiento_id,
    asientoNumero: api.asiento_numero,
    fecha: fechaDesdeApi(api.fecha),
    conceptoAsiento: api.concepto_asiento ?? "",
    codigoSubcuenta: api.codigo_subcuenta,
    concepto: api.concepto ?? "",
    debe: api.debe,
    haber: api.haber,
});

export const urlReportInforme = (tipo: TipoInformeContableReport, criteria: Criteria): string => {
    const q = criteriaAQueryString(criteria);
    return `${urls.INFORME_REPORT(tipo)}${q}`;
};

const informeConCriteria = async <TApi, T>(
    url: string,
    criteria: Criteria,
    conversor: (api: TApi) => T,
    msgError: string
): Promise<T> => {
    const q = criteriaAQueryString(criteria);
    return RestAPI.getItem(`${url}${q}`, conversor, msgError);
};

export const getInformeMayor: GetInformeMayor = async (criteria) =>
    informeConCriteria(urls.INFORME_MAYOR, criteria, informeMayorDesdeApi, "Error al cargar el libro mayor");

export const getInformeSumasSaldos: GetInformeSumasSaldos = async (criteria) =>
    RestAPI.getQuery(urls.INFORME_SUMAS_SALDOS, criteria, filaSumasSaldosDesdeApi, "Error al cargar sumas y saldos");

export const getInformeBalance: GetInformeBalance = async (criteria) =>
    RestAPI.getQuery(urls.INFORME_BALANCE, criteria, filaBalanceDesdeApi, "Error al cargar el balance");

export const getInformeIngresosGastos: GetInformeIngresosGastos = async (criteria) =>
    RestAPI.getQuery(
        urls.INFORME_INGRESOS_GASTOS,
        criteria,
        filaBalanceDesdeApi,
        "Error al cargar ingresos y gastos reconocidos"
    );

export const getInformePatrimonio: GetInformePatrimonio = async (criteria) =>
    informeConCriteria(
        urls.INFORME_PATRIMONIO,
        criteria,
        informePatrimonioDesdeApi,
        "Error al cargar el estado de cambios en el patrimonio neto"
    );

interface FilaLibroFacturasIvaApi {
    partida_id: number;
    fecha_asiento: string;
    asiento_numero: number;
    codigo_serie: string | null;
    numero_factura: string | null;
    codigo_factura: string | null;
    nombre_tercero: string | null;
    codigo_tercero: string | null;
    cif_nif: string | null;
    codigo_contrapartida: string | null;
    nombre_contrapartida: string | null;
    base_imponible: number;
    cuota_iva: number;
    porcentaje_iva: number;
    porcentaje_recargo: number;
    cod_impuesto: string | null;
    cod_grupo_iva_neg: string | null;
    tipo_calculo: string | null;
    documento: string | null;
}

export const filaLibroFacturasIvaDesdeApi = (api: FilaLibroFacturasIvaApi): FilaLibroFacturasIva => ({
    id: String(api.partida_id),
    partidaId: api.partida_id,
    fechaAsiento: fechaDesdeApi(api.fecha_asiento),
    asientoNumero: api.asiento_numero,
    codigoSerie: api.codigo_serie,
    numeroFactura: api.numero_factura,
    codigoFactura: api.codigo_factura,
    nombreTercero: api.nombre_tercero,
    codigoTercero: api.codigo_tercero,
    cifNif: api.cif_nif,
    codigoContrapartida: api.codigo_contrapartida,
    nombreContrapartida: api.nombre_contrapartida,
    baseImponible: api.base_imponible,
    cuotaIva: api.cuota_iva,
    porcentajeIva: api.porcentaje_iva,
    porcentajeRecargo: api.porcentaje_recargo,
    codImpuesto: api.cod_impuesto,
    codGrupoIvaNeg: api.cod_grupo_iva_neg,
    tipoCalculo: api.tipo_calculo,
    documento: api.documento,
});

export const getInformeLibroFacturasEmitidas: GetInformeLibroFacturasIva = async (criteria) =>
    RestAPI.getQuery(
        urls.INFORME_LIBRO_FACTURAS_EMITIDAS,
        criteria,
        filaLibroFacturasIvaDesdeApi,
        "Error al cargar el libro IVA facturas emitidas"
    );

export const getInformeLibroFacturasRecibidas: GetInformeLibroFacturasIva = async (criteria) =>
    RestAPI.getQuery(
        urls.INFORME_LIBRO_FACTURAS_RECIBIDAS,
        criteria,
        filaLibroFacturasIvaDesdeApi,
        "Error al cargar el libro IVA facturas recibidas"
    );

interface ReciboPagadoLibroReccApi {
    recibo_id: number;
    codigo: string | null;
    forma_pago_id: string | null;
    forma_pago: string | null;
    fecha_pago: string | null;
    importe: number | null;
}

interface FilaLibroFacturasRecCcajaApi {
    partida_id: number;
    fecha_asiento: string;
    asiento_numero: number;
    codigo_serie: string | null;
    numero_factura: number | null;
    numero_factura_proveedor: string | null;
    codigo_factura: string | null;
    codigo_proveedor: string | null;
    nombre_proveedor: string | null;
    cif_nif: string | null;
    codigo_subcuenta: string | null;
    codigo_contrapartida: string | null;
    base_imponible: number;
    cuota_iva: number;
    porcentaje_iva: number;
    porcentaje_recargo: number;
    cod_impuesto: string | null;
    cod_grupo_iva_neg: string | null;
    tipo_calculo: string | null;
    codigo_subcuenta_reversion: string | null;
    documento: string | null;
    criterio_caja: boolean;
    recibos?: ReciboPagadoLibroReccApi[];
}

interface LibroFacturasRecCcajaApi {
    datos: FilaLibroFacturasRecCcajaApi[];
    total: number;
    totales?: { base: number; cuota: number };
    resumen_iva?: {
        nombre: string;
        base: number;
        cuota: number;
        reversion: boolean;
        cuota_reversion: number;
    }[];
    totales_grupo_iva_neg?: {
        cod_grupo_iva_neg: string;
        base: number;
        cuota: number;
        cuota_reversion: number;
    }[];
}

export const filaLibroFacturasRecCcajaDesdeApi = (
    api: FilaLibroFacturasRecCcajaApi
): FilaLibroFacturasRecCcaja => ({
    id: String(api.partida_id),
    partidaId: api.partida_id,
    fechaAsiento: fechaDesdeApi(api.fecha_asiento),
    asientoNumero: api.asiento_numero,
    codigoSerie: api.codigo_serie,
    numeroFactura: api.numero_factura,
    numeroFacturaProveedor: api.numero_factura_proveedor,
    codigoFactura: api.codigo_factura,
    codigoProveedor: api.codigo_proveedor,
    nombreProveedor: api.nombre_proveedor,
    cifNif: api.cif_nif,
    codigoSubcuenta: api.codigo_subcuenta,
    codigoContrapartida: api.codigo_contrapartida,
    baseImponible: api.base_imponible,
    cuotaIva: api.cuota_iva,
    porcentajeIva: api.porcentaje_iva,
    porcentajeRecargo: api.porcentaje_recargo,
    codImpuesto: api.cod_impuesto,
    codGrupoIvaNeg: api.cod_grupo_iva_neg,
    tipoCalculo: api.tipo_calculo,
    codigoSubcuentaReversion: api.codigo_subcuenta_reversion,
    documento: api.documento,
    criterioCaja: api.criterio_caja,
    recibos: (api.recibos ?? []).map((r) => ({
        reciboId: r.recibo_id,
        codigo: r.codigo,
        formaPagoId: r.forma_pago_id,
        formaPago: r.forma_pago,
        fechaPago: r.fecha_pago ? fechaDesdeApi(r.fecha_pago) : null,
        importe: r.importe,
    })),
});

export const libroFacturasRecCcajaDesdeApi = (api: LibroFacturasRecCcajaApi): LibroFacturasRecCcaja => ({
    datos: api.datos.map(filaLibroFacturasRecCcajaDesdeApi),
    total: api.total,
    totales: api.totales ?? { base: 0, cuota: 0 },
    resumenIva: (api.resumen_iva ?? []).map((g) => ({
        nombre: g.nombre,
        base: g.base,
        cuota: g.cuota,
        reversion: g.reversion,
        cuotaReversion: g.cuota_reversion,
    })),
    totalesGrupoIvaNeg: (api.totales_grupo_iva_neg ?? []).map((g) => ({
        codGrupoIvaNeg: g.cod_grupo_iva_neg,
        base: g.base,
        cuota: g.cuota,
        cuotaReversion: g.cuota_reversion,
    })),
});

/** Devuelve también `totales`, `resumen_iva` y `totales_grupo_iva_neg` (que `getQuery` descartaría). */
export const getInformeLibroFacturasRecCcaja: GetInformeLibroFacturasRecCcaja = async (criteria) =>
    RestAPI.get<LibroFacturasRecCcajaApi>(
        `${urls.INFORME_LIBRO_FACTURAS_REC_CCaja}${criteriaAQueryString(criteria)}`,
        "Error al cargar el libro IVA recibidas (criterio de caja)"
    ).then(libroFacturasRecCcajaDesdeApi);

export const getInformePyg: GetInformePyg = async (criteria) =>
    RestAPI.getQuery(urls.INFORME_PYG, criteria, filaPygDesdeApi, "Error al cargar pérdidas y ganancias");

export const getInformeDiario: GetInformeDiario = async (criteria) =>
    RestAPI.getQuery(urls.INFORME_DIARIO, criteria, lineaDiarioDesdeApi, "Error al cargar el libro diario");

export const getReportInformeContable: GetReportInformeContable = async (tipo, criteria) =>
    RestAPI.blob(urlReportInforme(tipo, criteria), `Error al descargar PDF (${tipo})`);
