import { ClausulaFiltro, Criteria, Filtro } from "@olula/lib/diseño.ts";
import { formatearMoneda } from "@olula/lib/dominio.ts";
import { construirUrlConFiltro, fechaLocalStr } from "#/crm/widgets/comun.ts";
import { getRecibosVenta, getTotalesRecibosVenta } from "#/tesoreria/recibo_venta/infraestructura.ts";

export type EstadoCargaWidget = "cargando" | "listo";

export type ModeloWidgetRecibosCobro = {
    estado: EstadoCargaWidget;
    pendientesCobro: number;
    importePendiente: number;
    vencidos: number;
    urlPendientes: string;
    urlVencidos: string;
    textoImportePendiente: string;
};

const RUTA_RECIBOS = "/tesoreria/recibo_venta";
const DIVISA = "EUR";

const filtroEstadoEmitido = (): ClausulaFiltro[] => [
    ["estado", "eq", "Emitido"] as unknown as ClausulaFiltro,
];

export const filtroRecibosPendientesCobro = (): ClausulaFiltro[] =>
    filtroEstadoEmitido();

export const filtroRecibosVencidos = (hoy: Date = new Date()): ClausulaFiltro[] => [
    ...filtroEstadoEmitido(),
    ["fecha_vencimiento", "lt", fechaLocalStr(hoy)] as unknown as ClausulaFiltro,
];

const criteriaDesdeClausulas = (clausulas: ClausulaFiltro[]): Criteria =>
    ({ filtro: clausulas as unknown as Filtro, orden: [], paginacion: { pagina: 1, limite: 1 } }) as Criteria;

export const urlListadoRecibosPendientes = (): string =>
    construirUrlConFiltro(RUTA_RECIBOS, filtroRecibosPendientesCobro());

export const urlListadoRecibosVencidos = (hoy: Date = new Date()): string =>
    construirUrlConFiltro(RUTA_RECIBOS, filtroRecibosVencidos(hoy));

export const modeloWidgetRecibosCobroInicial: ModeloWidgetRecibosCobro = {
    estado: "cargando",
    pendientesCobro: 0,
    importePendiente: 0,
    vencidos: 0,
    urlPendientes: RUTA_RECIBOS,
    urlVencidos: RUTA_RECIBOS,
    textoImportePendiente: formatearMoneda(0, DIVISA),
};

export const cargarModeloWidgetRecibosCobro = async (
    hoy: Date = new Date()
): Promise<ModeloWidgetRecibosCobro> => {
    const criteriaPendientes = criteriaDesdeClausulas(filtroRecibosPendientesCobro());
    const criteriaVencidos = criteriaDesdeClausulas(filtroRecibosVencidos(hoy));

    const [listadoPendientes, listadoVencidos, totales] = await Promise.all([
        getRecibosVenta(criteriaPendientes),
        getRecibosVenta(criteriaVencidos),
        getTotalesRecibosVenta(criteriaPendientes),
    ]);

    return {
        estado: "listo",
        pendientesCobro: listadoPendientes.total,
        importePendiente: totales.importePendiente,
        vencidos: listadoVencidos.total,
        urlPendientes: urlListadoRecibosPendientes(),
        urlVencidos: urlListadoRecibosVencidos(hoy),
        textoImportePendiente: formatearMoneda(totales.importePendiente, DIVISA),
    };
};
