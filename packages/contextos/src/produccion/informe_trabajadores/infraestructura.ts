import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    FiltroListadoTrabajadores,
    FormatoHoja,
    GetHojaTrabajadores,
    GetListadoTrabajadores,
    GetReportTrabajadores,
    GrupoSeccion,
    ListadoTrabajadores,
} from "./diseño.ts";
import { queryListadoTrabajadores } from "./dominio.ts";

const baseUrl = "/produccion/informe/trabajadores";

interface GrupoSeccionApi {
    seccion_id: string | null;
    seccion: string | null;
    trabajadores: { id: string; nombre: string | null; de_baja: boolean | string | null }[];
    total: number | null;
}

export interface ListadoTrabajadoresApi {
    titulo: string;
    subtitulo: string | null;
    grupos: GrupoSeccionApi[];
    total: number | null;
}

const grupoDesdeApi = (api: GrupoSeccionApi): GrupoSeccion => {
    const trabajadores = (api.trabajadores ?? []).map((t) => ({
        id: t.id,
        nombre: t.nombre ?? "",
        deBaja: t.de_baja === true || t.de_baja === "true",
    }));
    return {
        seccionId: api.seccion_id ?? null,
        seccion: api.seccion ?? "",
        trabajadores,
        total: Number(api.total ?? trabajadores.length) || 0,
    };
};

export const listadoTrabajadoresDesdeApi = (api: ListadoTrabajadoresApi): ListadoTrabajadores => ({
    titulo: api.titulo,
    subtitulo: api.subtitulo ?? "",
    grupos: (api.grupos ?? []).map(grupoDesdeApi),
    total: Number(api.total ?? 0) || 0,
});

export const urlListadoTrabajadores = (filtro: FiltroListadoTrabajadores): string =>
    `${baseUrl}${queryListadoTrabajadores(filtro)}`;
export const urlReportTrabajadores = (filtro: FiltroListadoTrabajadores): string =>
    `${baseUrl}/report${queryListadoTrabajadores(filtro)}`;
export const urlHojaTrabajadores = (filtro: FiltroListadoTrabajadores, formato: FormatoHoja): string =>
    `${baseUrl}/hoja${queryListadoTrabajadores(filtro, formato)}`;

export const getListadoTrabajadores: GetListadoTrabajadores = async (filtro) =>
    RestAPI.getItem<ListadoTrabajadores, ListadoTrabajadoresApi>(
        urlListadoTrabajadores(filtro),
        listadoTrabajadoresDesdeApi,
        "Error al consultar el listado de trabajadores"
    );

export const getReportTrabajadores: GetReportTrabajadores = async (filtro) =>
    RestAPI.blob(urlReportTrabajadores(filtro), "Error al descargar el PDF de trabajadores");

export const getHojaTrabajadores: GetHojaTrabajadores = async (filtro, formato) =>
    RestAPI.blob(urlHojaTrabajadores(filtro, formato), "Error al descargar la hoja de trabajadores");
