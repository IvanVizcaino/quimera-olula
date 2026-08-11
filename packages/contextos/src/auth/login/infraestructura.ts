import { notifyAuthStorageChanged } from "@olula/lib/api/auth_storage_events.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { RespuestaLista } from "@olula/lib/diseño.ts";
import { Permiso } from "../grupos/diseño.ts";
import { Login, Logout, RefrescarToken, UsuarioLogin, UsuarioRefresco } from "./diseño.ts";
export { permisosGrupo } from "@olula/lib/api/permisos.ts";

const MINUTOS_REFRESCO = 15;
const MINUTOS = 60 * 1000;
const baseUrl = '/auth';

export interface RespuestaWhoAmI {
    tipo: string;
    permisos: Permiso[];
    plugins: Record<string, string>;
    usuario_id: string;
}

type PeticionLogin = { id: string; password: string; };
type RespuestaLogin = { token_acceso: string; token_refresco: string; };

export const login: Login = async (id: string, contraseña: string) => {
    const payload = { id, password: btoa(contraseña) };
    const callback: (_: RespuestaLogin) => UsuarioLogin = (respuesta) => ({ id: "_", tokenAcceso: respuesta.token_acceso, tokenRefresco: respuesta.token_refresco });

    return RestAPI.post<PeticionLogin>(`${baseUrl}/login`, payload).then(callback as unknown as (_: { id: string; }) => UsuarioLogin);
}

type RespuestaRefresco = { token: string; };
export const refrescarToken: RefrescarToken = async (tokenRefresco: string) => {
    const payload = { token: tokenRefresco };
    const callback: (_: RespuestaRefresco) => UsuarioRefresco = (respuesta) => ({ id: "_", tokenAcceso: respuesta.token as string });

    return RestAPI.post<RespuestaRefresco>(`${baseUrl}/refrescar`, payload).then(callback as unknown as (_: { id: string; }) => UsuarioRefresco);
}

export const logout: Logout = async (tokenRefresco: string) => {
    const payload = { token: tokenRefresco };
    RestAPI.post(`${baseUrl}/logout`, payload);
}

export const tokenAcceso = {
    actualizar: (tokenAcceso: string) => {
        const now = Date.now();
        const fechaRefresco = now + MINUTOS_REFRESCO * MINUTOS;

        localStorage.setItem("token-acceso", tokenAcceso);
        localStorage.setItem("fecha-refresco", fechaRefresco.toString());
        notifyAuthStorageChanged();
    },
    obtener: () => localStorage.getItem("token-acceso"),
    validez: () => {
        const fecha = localStorage.getItem("fecha-refresco");
        if (!fecha) return 0;

        const fechaRefresco = parseInt(fecha);
        if (isNaN(fechaRefresco)) return 0;

        const now = Date.now();
        const validez_minutos = (fechaRefresco - now) / MINUTOS;

        return validez_minutos;
    },
    eliminar: () => {
        localStorage.removeItem("fecha-refresco");
        localStorage.removeItem("token-acceso");
        notifyAuthStorageChanged();
    },
}

export const tokenRefresco = {
    actualizar: (tokenRefresco: string) => {
        localStorage.setItem("token-refresco", tokenRefresco);
        notifyAuthStorageChanged();
    },
    obtener: () => localStorage.getItem("token-refresco"),
    eliminar: () => {
        localStorage.removeItem("token-refresco");
        notifyAuthStorageChanged();
    },
}

export const whoAmIStorage = {
    actualizar: (whoAmI: RespuestaWhoAmI) => {
        localStorage.setItem("whoami", JSON.stringify(whoAmI));
        notifyAuthStorageChanged();
    },
    obtener: () => localStorage.getItem("whoami"),
    eliminar: () => {
        localStorage.removeItem("whoami");
        notifyAuthStorageChanged();
    },
}

export const misPermisos = async (): RespuestaLista<Permiso> => {
    return await RestAPI.get<{ datos: Permiso[]; total: number }>(baseUrl + '/permiso/mi_grupo');
};

export const whoAmI = async (): Promise<RespuestaWhoAmI> => {
    return await RestAPI.get<RespuestaWhoAmI>(baseUrl + '/permiso/whoami');
};

export const solicitarResetPasswordAPI = async (email: string): Promise<void> => {
    await RestAPI.post(`${baseUrl}/reset-password/solicitar`, { email });
};

export const resetPasswordAPI = async (token: string, nueva_password: string): Promise<void> => {
    await RestAPI.post(`${baseUrl}/reset-password/verificar`, { token, nueva_password });
};
