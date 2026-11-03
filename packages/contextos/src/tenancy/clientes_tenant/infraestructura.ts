import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "../comun/urls.js";
import {
    CambiosClienteTenant,
    ClienteTenant,
    DeleteClienteTenant,
    GetClienteTenant,
    GetClientesTenant,
    NuevoClienteTenant,
    PatchClienteTenant,
    PostClienteTenant,
} from "./diseño.js";

interface ClienteTenantApi {
    id: string;
    nombre: string;
    cadena_conexion_cifrada: string;
    activo: boolean;
}

interface NuevoClienteTenantApi {
    id: string;
    nombre: string;
    cadena_conexion: string;
    activo: boolean;
}

interface CambiosClienteTenantApi {
    nombre?: string;
    cadena_conexion?: string;
    activo?: boolean;
}

const baseUrl = new ApiUrls().CLIENTES_TENANT;

const clienteTenantDesdeApi = (api: ClienteTenantApi): ClienteTenant => ({
    id: api.id,
    nombre: api.nombre,
    cadenaConexionCifrada: api.cadena_conexion_cifrada,
    activo: api.activo,
});

const nuevoClienteTenantAApi = (c: NuevoClienteTenant): NuevoClienteTenantApi => ({
    id: c.id,
    nombre: c.nombre,
    cadena_conexion: c.cadenaConexion,
    activo: c.activo,
});

const cambiosClienteTenantAApi = (c: CambiosClienteTenant): CambiosClienteTenantApi => {
    const cambios: CambiosClienteTenantApi = {};
    if (c.nombre !== undefined) cambios.nombre = c.nombre;
    if (c.cadenaConexion !== undefined) cambios.cadena_conexion = c.cadenaConexion;
    if (c.activo !== undefined) cambios.activo = c.activo;
    return cambios;
};

export const getClienteTenant: GetClienteTenant = async (id) => {
    return await RestAPI.getItem<ClienteTenant, ClienteTenantApi>(
        `${baseUrl}/${id}`,
        clienteTenantDesdeApi,
    );
};

export const getClientesTenant: GetClientesTenant = async (criteria) => {
    return await RestAPI.getQuery<ClienteTenant, ClienteTenantApi>(
        baseUrl,
        criteria,
        clienteTenantDesdeApi,
    );
};

export const postClienteTenant: PostClienteTenant = async (nuevo) => {
    const respuesta = await RestAPI.post<NuevoClienteTenantApi>(
        baseUrl,
        nuevoClienteTenantAApi(nuevo),
        "Error al crear cliente tenant"
    );
    return respuesta.id;
};

export const patchClienteTenant: PatchClienteTenant = async (id, cambios) => {
    await RestAPI.patch<CambiosClienteTenantApi>(
        `${baseUrl}/${id}`,
        cambiosClienteTenantAApi(cambios),
        "Error al actualizar cliente tenant"
    );
};

export const deleteClienteTenant: DeleteClienteTenant = async (id) => {
    await RestAPI.delete(
        `${baseUrl}/${id}`,
        "Error al eliminar cliente tenant"
    );
};
