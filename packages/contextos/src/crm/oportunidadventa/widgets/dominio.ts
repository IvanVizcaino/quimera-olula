import { ClausulaFiltro, Filtro, Orden, Paginacion } from "@olula/lib/diseño.ts";
import { construirUrlConFiltro } from "../../widgets/comun.ts";
import {
    agruparPrevisionPorEstado,
    crearMapaProbabilidadEstados,
    obtenerIdsEstadosTerminales,
    type SerieEstadoPrevision,
} from "../dominio.ts";
import {
    getEstadosOportunidadVenta,
    getOportunidadesVenta,
} from "../infraestructura.ts";

export type EstadoCargaWidget = "cargando" | "listo";

export type ModeloWidgetPrevision = {
    estado: EstadoCargaWidget;
    oportunidadesAbiertas: number;
    previsionPotencial: number;
    seriePorEstado: SerieEstadoPrevision[];
    urlVer: string;
};

const RUTA_OPO_VENTA = "/crm/oportunidadventa";
const PAGINACION_INICIAL: Paginacion = { pagina: 1, limite: 200 };
const ORDEN_DEFECTO: Orden = ["probabilidad", "DESC", "fecha_cierre", "ASC"] as unknown as Orden;

export const modeloWidgetPrevisionInicial: ModeloWidgetPrevision = {
    estado: "cargando",
    oportunidadesAbiertas: 0,
    previsionPotencial: 0,
    seriePorEstado: [],
    urlVer: RUTA_OPO_VENTA,
};

const construirFiltroAbiertas = (idsTerminales: string[]): ClausulaFiltro[] =>
    [["estado_id", "!in", idsTerminales.join(",")] as unknown as ClausulaFiltro];

const construirFiltroApiAbiertas = (idsTerminales: string[]): Filtro => {
    if (idsTerminales.length === 0) return [] as unknown as Filtro;

    return [["estado_id", "!in", idsTerminales as unknown as string]] as unknown as Filtro;
};

const cargarOportunidades = async (
    filtro: Filtro,
    orden: Orden
) => {
    const primera = await getOportunidadesVenta(filtro, orden, PAGINACION_INICIAL);
    const datos = [...primera.datos];
    let pagina = PAGINACION_INICIAL.pagina + 1;

    while (datos.length < primera.total) {
        const siguiente = await getOportunidadesVenta(filtro, orden, {
            ...PAGINACION_INICIAL,
            pagina,
        });
        datos.push(...siguiente.datos);
        pagina += 1;
    }

    return datos;
};

const cargarOportunidadesAbiertas = async (idsTerminales: string[]) => {
    const filtro = construirFiltroAbiertas(idsTerminales);
    const filtroApi = construirFiltroApiAbiertas(idsTerminales);
    const oportunidades = await cargarOportunidades(
        filtroApi,
        ORDEN_DEFECTO
    );

    return { oportunidades, filtro };
};

export const cargarModeloWidgetPrevision = async (): Promise<ModeloWidgetPrevision> => {
    const estados = await getEstadosOportunidadVenta(
        [] as unknown as Filtro,
        ["id"] as unknown as Orden
    );

    const idsTerminales = obtenerIdsEstadosTerminales(estados);
    const probabilidadesPorEstado = crearMapaProbabilidadEstados(estados);

    const { oportunidades, filtro } = await cargarOportunidadesAbiertas(idsTerminales);
    const seriePorEstado = agruparPrevisionPorEstado(oportunidades, probabilidadesPorEstado);

    return {
        estado: "listo",
        oportunidadesAbiertas: oportunidades.length,
        previsionPotencial: seriePorEstado.reduce((acc, item) => acc + item.prevision, 0),
        seriePorEstado,
        urlVer: construirUrlConFiltro(RUTA_OPO_VENTA, filtro, {
            orden: ORDEN_DEFECTO,
            params: { modo: "kanban" },
        }),
    };
};
