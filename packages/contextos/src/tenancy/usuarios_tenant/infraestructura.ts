import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "../comun/urls.js";
import {
    CambiosUsuarioTenant,
    DeleteUsuarioTenant,
    GetUsuarioTenant,
    GetUsuariosTenant,
    NuevoUsuarioTenant,
    PatchUsuarioTenant,
    PostUsuarioTenant,
    UsuarioTenant,
} from "./diseño.js";

interface UsuarioTenantApi {
    id: string;
    email: string;
    nombre: string;
    cliente_id: string;
    activo: boolean;
}

interface NuevoUsuarioTenantApi {
    id: string;
    email: string;
    nombre: string;
    cliente_id: string;
    activo: boolean;
}

type CambiosUsuarioTenantApi = Partial<UsuarioTenantApi>;

const baseUrl = new ApiUrls().USUARIOS_TENANT;

const usuarioTenantDesdeApi = (api: UsuarioTenantApi): UsuarioTenant => ({
    id: api.id,
    email: api.email,
    nombre: api.nombre,
    clienteId: api.cliente_id,
    activo: api.activo,
});

const nuevoUsuarioTenantAApi = (u: NuevoUsuarioTenant): NuevoUsuarioTenantApi => ({
    id: u.id,
    email: u.email,
    nombre: u.nombre,
    cliente_id: u.clienteId,
    activo: u.activo,
});

const cambiosUsuarioTenantAApi = (u: CambiosUsuarioTenant): CambiosUsuarioTenantApi => {
    const cambios: CambiosUsuarioTenantApi = {};
    if (u.email !== undefined) cambios.email = u.email;
    if (u.nombre !== undefined) cambios.nombre = u.nombre;
    if (u.clienteId !== undefined) cambios.cliente_id = u.clienteId;
    if (u.activo !== undefined) cambios.activo = u.activo;
    return cambios;
};

export const getUsuarioTenant: GetUsuarioTenant = async (id) => {
    return await RestAPI.getItem<UsuarioTenant, UsuarioTenantApi>(
        `${baseUrl}/${id}`,
        usuarioTenantDesdeApi,
    );
};

export const getUsuariosTenant: GetUsuariosTenant = async (criteria) => {
    return await RestAPI.getQuery<UsuarioTenant, UsuarioTenantApi>(
        baseUrl,
        criteria,
        usuarioTenantDesdeApi,
    );
};

export const postUsuarioTenant: PostUsuarioTenant = async (nuevo) => {
    const respuesta = await RestAPI.post<NuevoUsuarioTenantApi>(
        baseUrl,
        nuevoUsuarioTenantAApi(nuevo),
        "Error al crear usuario tenant"
    );
    return respuesta.id;
};

export const patchUsuarioTenant: PatchUsuarioTenant = async (id, cambios) => {
    await RestAPI.patch<CambiosUsuarioTenantApi>(
        `${baseUrl}/${id}`,
        cambiosUsuarioTenantAApi(cambios),
        "Error al actualizar usuario tenant"
    );
};

export const deleteUsuarioTenant: DeleteUsuarioTenant = async (id) => {
    await RestAPI.delete(
        `${baseUrl}/${id}`,
        "Error al eliminar usuario tenant"
    );
};
