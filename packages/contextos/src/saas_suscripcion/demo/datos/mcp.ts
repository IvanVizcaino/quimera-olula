import { PeticionDemo, RespuestaFija } from "../api_demo.ts";
import { DemoModulo } from "../diseño.ts";
import { fechaHora } from "./comun.ts";

/**
 * Demo del conector MCP. Su pantalla en el front es «Claves de API» (/auth/apikey): cada
 * clave deja que un agente (Claude Code, ChatGPT, un agente propio) use Olula por MCP en
 * nombre del usuario; al crearla se enseña el comando para darla de alta en el agente.
 *
 * El alta devuelve `{token}` (no `{id}`): una respuesta fija la añade a la colección.
 */

type ClaveApi = { id: string; nombre: string; creada: string | null; caduca: string; caducada: boolean };

/** Alta de clave de API (POST /auth/apikey) sobre la colección "auth/apikey" de la demo. */
export const ALTA_CLAVE_API: RespuestaFija = {
    metodo: "POST",
    ruta: "auth/apikey",
    cuerpo: ({ cuerpo, colecciones, nuevoId }: PeticionDemo) => {
        const { nombre, expiracion } = (cuerpo ?? {}) as { nombre?: string; expiracion?: string };
        const dias = Number(/^(\d+)d$/.exec(expiracion ?? "")?.[1] ?? 30);
        const id = nuevoId();
        (colecciones["auth/apikey"] ??= []).unshift({
            id, nombre: nombre || "Nueva clave", creada: fechaHora(0, "12:00:00"),
            caduca: fechaHora(dias, "12:00:00"), caducada: false,
        });
        // Valor de ejemplo: no da acceso a nada.
        return { token: `${id}.ESTO_NO_ES_UNA_CLAVE_REAL.0000` };
    },
};

export const clave = (id: string, nombre: string, creada: number, caduca: number): ClaveApi => ({
    id, nombre, creada: fechaHora(creada, "10:15:00"), caduca: fechaHora(caduca, "10:15:00"), caducada: caduca < 0,
});

export const demo: DemoModulo = {
    pantallas: [{ nombre: "Claves de API (MCP)", ruta: "/auth/apikey" }],
    guia: "Crea una clave para conectar Claude u otro agente por MCP y copia el comando que te damos; revoca las que no uses.",
    colecciones: {
        "auth/apikey": [
            clave("1", "Claude Code · portátil de dirección", -12, 78),
            clave("2", "ChatGPT · conector de compras", -30, 60),
            clave("3", "Agente de informes semanales", -45, 320),
            clave("4", "Cursor · equipo de desarrollo", -5, 25),
            clave("5", "Prueba con Claude Desktop", -95, -5),
        ],
    },
    fijas: [ALTA_CLAVE_API],
};
