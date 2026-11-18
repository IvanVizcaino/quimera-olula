import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import {
    ClaseAlmacenamiento,
    DeleteClaseAlmacenamiento,
    GetClaseAlmacenamiento,
    GetClasesAlmacenamiento,
    NuevaClaseAlmacenamiento,
    PatchClaseAlmacenamiento,
    PostClaseAlmacenamiento,
} from "./diseño.ts";

const baseUrl = `/almacen/clase_almacenamiento`;

interface ClaseAlmacenamientoApi {
    id: string;
    codigo: string;
    descripcion: string;
}

type NuevaClaseAlmacenamientoApi = Omit<ClaseAlmacenamientoApi, "id">;
type CambiosClaseAlmacenamientoApi = Partial<NuevaClaseAlmacenamientoApi>;

export const claseAlmacenamientoDesdeApi = (api: ClaseAlmacenamientoApi): ClaseAlmacenamiento => ({
    id: api.id,
    codigo: api.codigo,
    descripcion: api.descripcion,
});

const nuevaClaseAApi = (c: NuevaClaseAlmacenamiento): NuevaClaseAlmacenamientoApi => ({
    codigo: c.codigo,
    descripcion: c.descripcion,
});

const cambiosClaseAApi = (c: Partial<ClaseAlmacenamiento>): CambiosClaseAlmacenamientoApi => {
    const cambios: CambiosClaseAlmacenamientoApi = {};
    if (c.codigo !== undefined) cambios.codigo = c.codigo;
    if (c.descripcion !== undefined) cambios.descripcion = c.descripcion;
    return cambios;
};

export const getClaseAlmacenamiento: GetClaseAlmacenamiento = async (id) =>
    RestAPI.getItem<ClaseAlmacenamiento, ClaseAlmacenamientoApi>(`${baseUrl}/${id}`, claseAlmacenamientoDesdeApi);

export const getClasesAlmacenamiento: GetClasesAlmacenamiento = async (criteria: Criteria) =>
    RestAPI.getQuery<ClaseAlmacenamiento, ClaseAlmacenamientoApi>(baseUrl, criteria, claseAlmacenamientoDesdeApi);

export const postClaseAlmacenamiento: PostClaseAlmacenamiento = async (nueva) => {
    const respuesta = await RestAPI.post<NuevaClaseAlmacenamientoApi>(
        baseUrl,
        nuevaClaseAApi(nueva),
        "Error al crear clase de almacenamiento"
    );
    return respuesta.id;
};

export const patchClaseAlmacenamiento: PatchClaseAlmacenamiento = async (id, cambios) => {
    await RestAPI.patch<CambiosClaseAlmacenamientoApi>(
        `${baseUrl}/${id}`,
        cambiosClaseAApi(cambios),
        "Error al actualizar clase de almacenamiento"
    );
};

export const deleteClaseAlmacenamiento: DeleteClaseAlmacenamiento = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, "Error al borrar clase de almacenamiento");
};
