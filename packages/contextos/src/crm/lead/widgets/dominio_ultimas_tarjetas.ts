import { ClausulaFiltro, Filtro, Orden, Paginacion } from "@olula/lib/diseño.ts";
import {
    construirUrlConFiltro,
    EstadoCargaWidget
} from "../../widgets/comun.ts";
import { Lead } from "../diseño.ts";
import { getLeads } from "../infraestructura.ts";

export type ModeloWidgetUltimasTarjetas = {
    estado: EstadoCargaWidget;
    tarjetas: Lead[];
    urlVer: string;
};

const RUTA_LEADS = "/crm/lead";
const ORDEN_ULTIMAS_TARJETAS: Orden = ["id", "DESC"] as unknown as Orden;
const PAGINACION_ULTIMAS_TARJETAS: Paginacion = { pagina: 1, limite: 3 };

export const modeloWidgetUltimasTarjetasInicial: ModeloWidgetUltimasTarjetas = {
    estado: "cargando",
    tarjetas: [],
    urlVer: RUTA_LEADS,
};

export const cargarModeloWidgetUltimasTarjetas = async (): Promise<ModeloWidgetUltimasTarjetas> => {
    const filtro: ClausulaFiltro[] = [];

    const resultado = await getLeads(
        filtro as unknown as Filtro,
        ORDEN_ULTIMAS_TARJETAS,
        PAGINACION_ULTIMAS_TARJETAS
    );

    return {
        estado: "listo",
        tarjetas: resultado.datos,
        urlVer: construirUrlConFiltro(RUTA_LEADS, filtro),
    };
};