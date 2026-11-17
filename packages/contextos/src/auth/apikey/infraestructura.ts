import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { ApiKey, DeleteApiKey, GetMisApiKeys, NuevaApiKey, PostApiKey } from "./diseño.ts";
import { urlMcp } from "./dominio.ts";

export interface ApiKeyApi {
    id: number;
    nombre: string;
    creada: string | null;
    caduca: string;
    caducada: boolean;
}

const baseUrl = "/auth/apikey";

export const apiKeyDesdeApi = (api: ApiKeyApi): ApiKey => ({
    id: String(api.id),
    nombre: api.nombre,
    creada: api.creada ? new Date(Date.parse(api.creada)) : null,
    caduca: new Date(Date.parse(api.caduca)),
    caducada: api.caducada,
});

export const getMisApiKeys: GetMisApiKeys = async () => {
    const respuesta = await RestAPI.get<{ datos: ApiKeyApi[] }>(
        baseUrl,
        "Error al leer las claves de API",
    );
    return respuesta.datos.map(apiKeyDesdeApi);
};

export const postApiKey: PostApiKey = async (nueva: NuevaApiKey) => {
    const respuesta = (await RestAPI.post<{ nombre: string; expiracion: string }>(
        baseUrl,
        { nombre: nueva.nombre.trim(), expiracion: nueva.expiracion },
        "Error al crear la clave de API",
    )) as unknown as { token: string };
    return respuesta.token;
};

export const deleteApiKey: DeleteApiKey = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, "Error al revocar la clave de API");
};

/** URL del endpoint MCP de este servidor, para el comando que se copia al agente. */
export const urlMcpServidor = (): string =>
    urlMcp(import.meta.env.VITE_API_URL || "http://localhost:5000", window.location.origin);
