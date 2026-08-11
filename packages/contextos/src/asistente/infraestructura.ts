import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { tokenAcceso } from "@olula/lib/api/token_acceso.ts";
import { eventoStreamDesdeApi, hiloDesdeApi, mensajesHiloDesdeApi, normalizarRespuestaIa } from "#/asistente/dominio.ts";
import { A2uiClientAction, ConsultaIa, EventoStreamIa, HiloIa, MensajesHiloIa, RespuestaIa } from "#/asistente/diseño.ts";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const URL_IA = "/comun/ia";
const URL_IA_STREAM = "/comun/ia/stream";
const URL_IA_ACCION = "/comun/ia/a2ui-action";
const URL_IA_HILOS = "/comun/ia/hilos";

export const consultaAApi = (consulta: ConsultaIa) => ({
    pregunta: consulta.pregunta,
    thread_id: consulta.threadId,
    ...(consulta.capacidades ? { capacidades: consulta.capacidades } : {}),
    ...(consulta.capacidadesHash ? { capacidades_hash: consulta.capacidadesHash } : {}),
    ...(consulta.contextoApp
        ? { contexto_app: { ruta_actual: consulta.contextoApp.rutaActual, app: consulta.contextoApp.app } }
        : {}),
    ...(consulta.adjuntos?.length
        ? {
            adjuntos: consulta.adjuntos.map(a => ({
                nombre: a.nombre, tipo_mime: a.tipoMime, datos_base64: a.datosBase64,
            })),
        }
        : {}),
});

export const consultarIa = async (consulta: ConsultaIa): Promise<RespuestaIa> => {
    const raw = (await RestAPI.post(
        URL_IA,
        consultaAApi(consulta),
        "Error al consultar el asistente"
    )) as unknown as Record<string, unknown>;
    return normalizarRespuestaIa(raw);
};

export async function* consultarIaStream(
    consulta: ConsultaIa,
    signal?: AbortSignal
): AsyncGenerator<EventoStreamIa> {
    const res = await fetch(`${BASE}${URL_IA_STREAM}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${tokenAcceso.obtener() ?? ""}`,
        },
        body: JSON.stringify(consultaAApi(consulta)),
        signal,
    });

    if (!res.ok) {
        throw new Error(`Error del servidor: ${res.status}`);
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lineas = buffer.split("\n");
        buffer = lineas.pop() ?? "";

        for (const linea of lineas) {
            if (linea.startsWith("data: ")) {
                try {
                    yield eventoStreamDesdeApi(JSON.parse(linea.slice(6)));
                } catch {
                    // Ignorar líneas SSE mal formadas
                }
            }
        }
    }
}

export const listarHilos = async (): Promise<HiloIa[]> => {
    const raw = (await RestAPI.get<{ hilos: Record<string, unknown>[] }>(
        URL_IA_HILOS,
        "Error al listar las conversaciones"
    ));
    return raw.hilos.map(hiloDesdeApi);
};

export const obtenerMensajesHilo = async (threadId: string): Promise<MensajesHiloIa> => {
    const raw = (await RestAPI.get<Record<string, unknown>>(
        `${URL_IA_HILOS}/${threadId}/mensajes`,
        "Error al recuperar la conversación"
    ));
    return mensajesHiloDesdeApi(raw);
};

export const borrarHilo = async (threadId: string): Promise<void> => {
    await RestAPI.delete(`${URL_IA_HILOS}/${threadId}`, "Error al borrar la conversación");
};

/** Bytes de un adjunto ya persistido de un hilo — vía RestAPI.blob (mismo mecanismo que
 * ya usa la descarga del PDF de factura) porque un <audio src>/<a href> normal no puede
 * llevar la cabecera Authorization. */
export const obtenerAdjuntoHilo = (threadId: string, adjuntoId: string): Promise<Blob> =>
    RestAPI.blob(`${URL_IA_HILOS}/${threadId}/adjuntos/${adjuntoId}`, "Error al recuperar el adjunto");

export const enviarAccionA2ui = async (
    accion: A2uiClientAction,
    threadId: string | null
): Promise<RespuestaIa> => {
    const raw = (await RestAPI.post(
        URL_IA_ACCION,
        { version: "v0.9", action: accion, thread_id: threadId },
        "Error al enviar la acción"
    )) as unknown as Record<string, unknown>;
    return normalizarRespuestaIa(raw);
};
