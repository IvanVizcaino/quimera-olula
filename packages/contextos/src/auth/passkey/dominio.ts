import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { permisosGrupo, tokenAcceso, tokenRefresco, whoAmI, whoAmIStorage } from "../login/infraestructura.ts";
import {
    finalizarAutenticacionAPI,
    finalizarRegistroAPI,
    iniciarAutenticacionAPI,
    iniciarRegistroAPI,
    solicitarEnlaceMagicoAPI,
    verificarEnlaceMagicoAPI,
} from "./infraestructura.ts";

export const registrarPasskey = async (usuario_id: string): Promise<void> => {
    const opciones = await iniciarRegistroAPI(usuario_id);
    const resultado = await startRegistration({ optionsJSON: opciones as never });
    await finalizarRegistroAPI(usuario_id, JSON.stringify(resultado));
};

export const solicitarEnlaceMagico = (email: string): Promise<void> =>
    solicitarEnlaceMagicoAPI(email);

export const verificarEnlaceMagico = async (token: string): Promise<void> => {
    const datosLogin = await verificarEnlaceMagicoAPI(token);
    tokenAcceso.actualizar(datosLogin.tokenAcceso);
    tokenRefresco.actualizar(datosLogin.tokenRefresco);
    const datosWhoAmI = await whoAmI();
    whoAmIStorage.actualizar(datosWhoAmI);
    permisosGrupo.actualizar(datosWhoAmI.permisos);
};

export const autenticarConPasskey = async (): Promise<{ tokenAcceso: string; tokenRefresco: string }> => {
    const { session_id, ...opcionesWebauthn } = await iniciarAutenticacionAPI();
    const resultado = await startAuthentication({ optionsJSON: opcionesWebauthn as never });
    const datosLogin = await finalizarAutenticacionAPI(JSON.stringify(resultado), session_id);

    tokenAcceso.actualizar(datosLogin.tokenAcceso);
    tokenRefresco.actualizar(datosLogin.tokenRefresco);

    return datosLogin;
};
