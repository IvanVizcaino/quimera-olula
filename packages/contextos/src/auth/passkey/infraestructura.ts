import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { UsuarioLogin } from "../login/diseño.ts";
import { FinalizarAutenticacion, FinalizarRegistro, IniciarAutenticacion, IniciarRegistro, RespuestaIniciarAutenticacion, SolicitarEnlaceMagico, VerificarEnlaceMagico } from "./diseño.ts";

const baseUrl = "/auth/passkey";

type RespuestaLogin = { token_acceso: string; token_refresco: string };
type PeticionFinalizar = { usuario_id: string; credential: string; nombre?: string | null };

export const iniciarRegistroAPI: IniciarRegistro = (usuario_id: string) =>
    RestAPI.post(`${baseUrl}/registro/iniciar`, { usuario_id }) as Promise<unknown>;

export const finalizarRegistroAPI: FinalizarRegistro = (usuario_id: string, credential: string, nombre?: string | null) =>
    RestAPI.post<PeticionFinalizar>(`${baseUrl}/registro/finalizar`, { usuario_id, credential, nombre })
        .then(() => undefined);

export const iniciarAutenticacionAPI: IniciarAutenticacion = () =>
    RestAPI.post(`${baseUrl}/autenticacion/iniciar`, {}) as unknown as Promise<RespuestaIniciarAutenticacion>;

export const finalizarAutenticacionAPI: FinalizarAutenticacion = (credential: string, session_id: string) => {
    const callback = (respuesta: RespuestaLogin): UsuarioLogin => ({
        id: "_",
        tokenAcceso: respuesta.token_acceso,
        tokenRefresco: respuesta.token_refresco,
    });
    return RestAPI.post<{ credential: string; session_id: string }>(
        `${baseUrl}/autenticacion/finalizar`,
        { credential, session_id }
    ).then(callback as unknown as (_: { id: string }) => UsuarioLogin);
};

export const solicitarEnlaceMagicoAPI: SolicitarEnlaceMagico = (email: string) =>
    RestAPI.post(`${baseUrl}/enlace-magico/solicitar`, { email }).then(() => undefined);

export const verificarEnlaceMagicoAPI: VerificarEnlaceMagico = (token: string) => {
    const callback = (respuesta: RespuestaLogin): UsuarioLogin => ({
        id: "_",
        tokenAcceso: respuesta.token_acceso,
        tokenRefresco: respuesta.token_refresco,
    });
    return RestAPI.post<{ token: string }>(`${baseUrl}/enlace-magico/verificar`, { token })
        .then(callback as unknown as (_: { id: string }) => UsuarioLogin);
};
