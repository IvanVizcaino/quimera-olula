import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria, Filtro, Orden, Paginacion } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import { getUbicaciones } from "../ubicacion/infraestructura.ts";
import { Ubicacion } from "../ubicacion/diseño.ts";
import { DeleteZona, GetZona, GetZonas, NuevaZona, PatchZona, PostZona, Zona } from "./diseño.ts";

const baseUrl = `/almacen/zona`;

interface ZonaApi {
    id: string;
    codigo: string;
    almacen_id: string;
    descripcion: string | null;
}

interface NuevaZonaApi {
    codigo: string;
    almacen_id: string;
    descripcion: string | null;
}

type CambiosZonaApi = Partial<ZonaApi>;

export const zonaDesdeApi = (api: ZonaApi): Zona => ({
    id: api.id,
    codigo: api.codigo,
    almacenId: api.almacen_id,
    descripcion: api.descripcion,
});

const nuevaZonaAApi = (z: NuevaZona): NuevaZonaApi => ({
    codigo: z.codigo,
    almacen_id: z.almacenId,
    descripcion: z.descripcion,
});

const cambiosZonaAApi = (z: Partial<Zona>): CambiosZonaApi => {
    const cambios: CambiosZonaApi = {};
    if (z.codigo !== undefined) cambios.codigo = z.codigo;
    if (z.almacenId !== undefined) cambios.almacen_id = z.almacenId;
    if (z.descripcion !== undefined) cambios.descripcion = z.descripcion;
    return cambios;
};

export const getZona: GetZona = async (id) =>
    RestAPI.getItem<Zona, ZonaApi>(`${baseUrl}/${id}`, zonaDesdeApi);

export const getZonas: GetZonas = async (criteria: Criteria) =>
    RestAPI.getQuery<Zona, ZonaApi>(baseUrl, criteria, zonaDesdeApi);

export const getZonasLista = async (filtro: Filtro, orden: Orden, paginacion?: Paginacion) => {
    const q = criteriaQuery(filtro, orden, paginacion);
    const respuesta = await RestAPI.get<{ datos: ZonaApi[]; total: number }>(baseUrl + q);
    return { datos: respuesta.datos.map(zonaDesdeApi), total: respuesta.total };
};

export const postZona: PostZona = async (nuevaZona) => {
    const respuesta = await RestAPI.post<NuevaZonaApi>(
        baseUrl,
        nuevaZonaAApi(nuevaZona),
        "Error al crear zona"
    );
    return respuesta.id;
};

export const patchZona: PatchZona = async (id, cambios) => {
    await RestAPI.patch<CambiosZonaApi>(
        `${baseUrl}/${id}`,
        cambiosZonaAApi(cambios),
        "Error al actualizar zona"
    );
};

export const deleteZona: DeleteZona = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, "Error al eliminar zona");
};

export const getUbicacionesZona = async (zonaId: string): Promise<Ubicacion[]> => {
    const resultado = await getUbicaciones(
        [["zona_id", "==", zonaId]],
        ["codigo", "ASC"]
    );
    return resultado.datos;
};
