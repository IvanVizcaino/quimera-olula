import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.js";
import { NuevaApiKey } from "./diseño.ts";

export const OPCIONES_CADUCIDAD = [
    { valor: "7d", descripcion: "7 días" },
    { valor: "30d", descripcion: "30 días" },
    { valor: "90d", descripcion: "90 días" },
    { valor: "365d", descripcion: "1 año" },
];

/** Constante (no función) para que useModelo no resetee el formulario en cada render. */
export const nuevaApiKeyVacia: NuevaApiKey = {
    nombre: "",
    expiracion: "30d",
};

export const metaNuevaApiKey: MetaModelo<NuevaApiKey> = {
    campos: {
        nombre: {
            requerido: true,
            validacion: (m: NuevaApiKey) => stringNoVacio(m.nombre.trim()),
        },
        expiracion: {
            requerido: true,
            validacion: (m: NuevaApiKey) => stringNoVacio(m.expiracion),
        },
    },
};

/** Nombre con el que el agente verá el servidor MCP de Olula. */
export const NOMBRE_SERVIDOR_MCP = "olula";

/** URL absoluta del endpoint MCP a partir de la de la API, aunque esta sea relativa. */
export const urlMcp = (urlApi: string, origen: string): string =>
    `${new URL(urlApi, origen).href.replace(/\/+$/, "")}/mcp`;

/** Orden de Claude Code que da de alta Olula como servidor MCP con esta clave. */
export const comandoClaudeMcp = (url: string, clave: string): string =>
    `claude mcp add --transport http ${NOMBRE_SERVIDOR_MCP} ${url} --header "Authorization: X-Api-Key ${clave}"`;
