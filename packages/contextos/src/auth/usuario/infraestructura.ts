import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { RespuestaLista2 } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import { Logout } from "../login/diseño.ts";
import { DeleteUsuario, GenerarTokenUsuario, GetTokenUsuario, GetUsuario, GetUsuarios, PatchUsuario, PostUsuario, Usuario, UsuarioAPI, UsuarioApi } from "./diseño.ts";


const baseUrl = '/auth';
const baseUrlUsuario = `/auth/usuario`;

export const usuarioFromAPI = (c: UsuarioApi): Usuario => ({
    ...c,
    empresas: c.empresas ?? [],
});

export const usuarioToApi = (usuario: Usuario): UsuarioAPI => ({
    ...usuario,
    usuario_id: usuario.id,
    empresas: usuario.empresas ?? [],
});

export const logout: Logout = async (tokenRefresco: string) => {
    const payload = { token: tokenRefresco };
    RestAPI.post(`${baseUrl}/logout`, payload);
}

export const getUsuario: GetUsuario = async (id) =>
    await RestAPI.get<{ datos: UsuarioAPI }>(`${baseUrlUsuario}/${id}`).then((respuesta) =>
        usuarioFromAPI(respuesta.datos)
    );

export const getUsuarios: GetUsuarios = async (filtro, orden, paginacion) => {

    const q = criteriaQuery(filtro, orden, paginacion);
    const respuesta = await RestAPI.get<RespuestaLista2<Usuario>>(baseUrlUsuario + q);

    return { datos: respuesta.datos.map(usuarioFromAPI), total: respuesta.total };
};

export const postUsuario: PostUsuario = async (usuario) => {
    const apiUsuario = usuarioToApi(usuario as Usuario);
    return await RestAPI.post(baseUrlUsuario, apiUsuario, "Error al guardar Usuario").then(
        (respuesta) => respuesta.id
    );
};

export const patchUsuario: PatchUsuario = async (id, usuario) => {
    const apiUsuario = usuarioToApi(usuario as Usuario);
    const usuarioSinNulls = Object.fromEntries(
        Object.entries(apiUsuario).map(([k, v]) => [k, v === null ? "" : v])
    );
    await RestAPI.patch(`${baseUrlUsuario}/${id}`, usuarioSinNulls, "Error al guardar Usuario");
};

export const deleteUsuario: DeleteUsuario = async (id) => {
    await RestAPI.delete(`${baseUrlUsuario}/${id}`, "Error al borrar Usuario");
};

export const generarTokenUsuario: GenerarTokenUsuario = async (id, expiracion) => {
    const payload = { id, expiracion };
    const callback = (respuesta: { token: string }) => respuesta.token as string;
    return RestAPI.post(`/auth/token`, payload, "Error al generar token")
        .then(callback as unknown as (_: { id: string }) => string);
}

export const getTokenUsuario: GetTokenUsuario = async (id) =>
    await RestAPI.get<{ token: string }>(`/auth/usuario/${id}/token_refresco`).then((respuesta) =>
        respuesta.token
    );