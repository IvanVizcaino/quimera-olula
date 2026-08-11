import { ClausulaFiltro, Filtro, Orden, Paginacion } from "@olula/lib/diseño.ts";
import {
    construirUrlConFiltro,
    EstadoCargaWidget
} from "../../widgets/comun.ts";
import { OportunidadVenta } from "../diseño.ts";
import { obtenerIdsEstadosTerminales } from "../dominio.ts";
import { getEstadosOportunidadVenta, getOportunidadesVenta } from "../infraestructura.ts";

export type ModeloWidgetUltimasOportunidades = {
    estado: EstadoCargaWidget;
    oportunidades: OportunidadVenta[];
    urlVer: string;
};

const RUTA_OPO_VENTA = "/crm/oportunidadventa";
const ORDEN_ATENCION: Orden = ["fecha_cierre", "ASC", "id", "DESC"] as unknown as Orden;
const PAGINACION_ATENCION: Paginacion = { pagina: 1, limite: 20 };
const LIMITE_WIDGET = 3;

export const modeloWidgetUltimasOportunidadesInicial: ModeloWidgetUltimasOportunidades = {
    estado: "cargando",
    oportunidades: [],
    urlVer: RUTA_OPO_VENTA,
};

const normalizarFecha = (fecha: Date): Date => {
    const copia = new Date(fecha);
    copia.setHours(0, 0, 0, 0);
    return copia;
};

const diasHastaCierre = (fecha: Date): number => {
    const hoy = normalizarFecha(new Date());
    const cierre = normalizarFecha(fecha);
    return Math.floor((cierre.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
};

const oportunidadRequiereAtencion = (oportunidad: OportunidadVenta): boolean => {
    if (!oportunidad.fecha_cierre) return false;
    return diasHastaCierre(oportunidad.fecha_cierre) <= 7;
};

const priorizarPorAtencion = (oportunidades: OportunidadVenta[]): OportunidadVenta[] => {
    return [...oportunidades].sort((a, b) => {
        const diasA = a.fecha_cierre ? diasHastaCierre(a.fecha_cierre) : Number.POSITIVE_INFINITY;
        const diasB = b.fecha_cierre ? diasHastaCierre(b.fecha_cierre) : Number.POSITIVE_INFINITY;

        if (diasA !== diasB) return diasA - diasB;

        const probA = a.probabilidad ?? 0;
        const probB = b.probabilidad ?? 0;
        return probB - probA;
    });
};

export const cargarModeloWidgetUltimasOportunidades = async (): Promise<ModeloWidgetUltimasOportunidades> => {
    const estados = await getEstadosOportunidadVenta(
        [] as unknown as Filtro,
        ["id"] as unknown as Orden
    );
    const idsTerminales = obtenerIdsEstadosTerminales(estados);

    const filtro: ClausulaFiltro[] = [];
    const filtroApi: ClausulaFiltro[] = [];

    if (idsTerminales.length > 0) {
        filtro.push(["estado_id", "!in", idsTerminales.join(",")] as ClausulaFiltro);
        filtroApi.push(["estado_id", "!in", idsTerminales as unknown as string] as ClausulaFiltro);
    }

    const resultado = await getOportunidadesVenta(
        filtroApi as unknown as Filtro,
        ORDEN_ATENCION,
        PAGINACION_ATENCION
    );

    const priorizadas = priorizarPorAtencion(resultado.datos);
    const atencion = priorizadas.filter(oportunidadRequiereAtencion);
    const oportunidadesWidget = (atencion.length > 0 ? atencion : priorizadas).slice(0, LIMITE_WIDGET);

    return {
        estado: "listo",
        oportunidades: oportunidadesWidget,
        urlVer: construirUrlConFiltro(RUTA_OPO_VENTA, filtro),
    };
};