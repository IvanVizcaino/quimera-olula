import type { AccionPantalla, DescripcionControl } from "@olula/lib/controles_pantalla.ts";

/**
 * Contrato API del asistente IA (implementado por un backend externo a este repo).
 *
 * POST /comun/ia (y /comun/ia/stream para el equivalente en streaming):
 *   - `capacidades` va completo SOLO cuando `thread_id` es null (primer mensaje de un thread).
 *   - En mensajes siguientes del mismo thread se manda `capacidades_hash` en su lugar (nunca ambos).
 *     Ese hash lo calcula SIEMPRE el servidor (campo `capacidades_hash` de la respuesta) — el
 *     cliente solo lo guarda y lo reenvía tal cual, nunca lo calcula él mismo (evita divergencias
 *     de algoritmo entre JS/Python para el mismo contenido).
 *   - Si el backend no reconoce `capacidades_hash` (p.ej. cambiaron los permisos del usuario),
 *     responde `necesita_capacidades: true` y el frontend reintenta la misma pregunta mandando
 *     `capacidades` completas.
 *   - `accion_navegacion` y `a2ui_messages` pueden convivir con `respuesta` en la misma respuesta.
 *   - El backend decide internamente si la petición se resuelve con una `capacidad` (ruta/formulario
 *     propio de la app) o con una tool MCP; esa decisión y la ejecución MCP nunca cruzan este contrato.
 */

export interface Capacidad {
    ruta: string;
    /** Nombre corto para mostrar (p. ej. en el botón de navegación) — NO usar `descripcion` para eso: es el texto largo pensado para que el LLM decida cuándo aplica esta capacidad. */
    nombre: string;
    descripcion: string;
    parametros?: Record<string, string>;
    regla?: string | string[];
}

export interface AccionNavegacion {
    ruta: string;
    parametros?: Record<string, string>;
    /** Nombre corto de la pantalla destino (p. ej. "Pedidos") — el botón compone "Ir a {descripcion}"; nunca la descripción larga pensada para el LLM. */
    descripcion?: string | null;
}

/** Presente cuando `guardar_documento` ha generado un fichero en este turno — el
 * cliente muestra un botón de descarga real en vez de depender de que el LLM
 * reproduzca la URL correctamente en su respuesta de texto (ya ha fallado: URL
 * relativa, enlace mal formado). `url` es pública (sin cabecera Authorization). */
export interface AccionDescarga {
    url: string;
    nombreFichero: string;
}

/** Audio/documento (Excel, PDF) que se manda junto con un mensaje. */
export interface AdjuntoIa {
    nombre: string;
    tipoMime: string;
    datosBase64: string;
}

/** Origen de un hilo/turno — 'voz' es el modo manos libres (un único hilo por usuario,
 * respuestas pensadas para leerse en voz alta). Los otros los crea el propio backend. */
export type CanalIa = "web" | "voz" | "telegram" | "tarea_programada";

export interface ConsultaIa {
    pregunta: string;
    threadId: string | null;
    capacidades?: Capacidad[];
    capacidadesHash?: string;
    contextoApp?: { rutaActual?: string; app?: string; pantalla?: ContextoPantalla };
    adjuntos?: AdjuntoIa[];
    /** Sin informar = "web". */
    canal?: CanalIa;
    /** Documentado aquí por claridad; se inyecta directamente en consultaAApi
     * (vía empresaActual()) en vez de exigir que cada caller lo pase. */
    empresaId?: string;
}

/** Lo que el usuario tiene delante (contexto_app.pantalla): para que el asistente
 * entienda "este pedido" y pueda manejar la pantalla (ver controles_pantalla.ts). */
export interface ContextoPantalla {
    ruta: string;
    /** Nombre corto de la pantalla (del menú), si se conoce. */
    nombre: string | null;
    /** Registro abierto (?id= de la URL). */
    idActivo: string | null;
    /** Resumen legible del registro abierto, si está en el listado visible. */
    descripcionActivo: string | null;
    controles: DescripcionControl[];
}

/** Metadatos (sin bytes) de un adjunto ya persistido — llega en RespuestaIa/MensajeHiloIa;
 * los bytes se piden aparte con obtenerAdjuntoHilo cuando hacen falta. */
export interface AdjuntoHiloIa {
    id: string;
    nombre: string;
    tipoMime: string;
}

export interface RespuestaIa {
    respuesta: string;
    threadId: string;
    a2uiMessages: unknown[];
    /** Calculado por el servidor — guardar y reenviar tal cual como `capacidadesHash`, nunca recalcular. */
    capacidadesHash: string | null;
    necesitaCapacidades: boolean;
    accionNavegacion: AccionNavegacion | null;
    descarga: AccionDescarga | null;
    /** Acciones sobre la pantalla actual decididas por el asistente (tool
     * controlar_pantalla) — el cliente las ejecuta en orden. */
    accionesPantalla: AccionPantalla[];
    /** Metadatos de los adjuntos de este turno, ya persistidos en el servidor. */
    adjuntos: AdjuntoHiloIa[];
    /** True SOLO cuando el turno tardaba demasiado y se ha encolado para terminar en
     * segundo plano — `respuesta` es un aviso, no la respuesta definitiva. El cliente
     * debe sondear GET .../hilos/{threadId}/mensajes periódicamente hasta ver una
     * respuesta nueva (ver useSondeoTurnoEncolado en AsistenteRuntimeProvider.tsx). */
    encolado: boolean;
}

export interface A2uiClientAction {
    name: string;
    surfaceId: string;
    sourceComponentId: string;
    timestamp: string;
    context: Record<string, unknown>;
}

export type EventoStreamIa =
    | { tipo: "delta"; contenido: string }
    /** Aviso de progreso transitorio (p.ej. "Buscando el cliente…") — el cliente lo
     * muestra sustituyendo el texto del mensaje, no acumulándolo: desaparece en
     * cuanto llega el primer "delta" real de la respuesta final. */
    | { tipo: "estado"; contenido: string }
    | { tipo: "a2ui"; a2uiMessage: unknown }
    | { tipo: "accion_navegacion"; accionNavegacion: AccionNavegacion }
    | { tipo: "descarga"; descarga: AccionDescarga }
    | { tipo: "accion_pantalla"; accionPantalla: AccionPantalla }
    | { tipo: "fin"; threadId: string; necesitaCapacidades?: boolean; adjuntos: AdjuntoHiloIa[] }
    | { tipo: "error"; contenido: string }
    /** Igual que "error" pero recuperable: el turno se ha encolado en el servidor
     * para terminar en segundo plano — ver RespuestaIa.encolado. */
    | { tipo: "encolado"; threadId: string; contenido: string };

/** Adjunto tal como vive en el estado del mensaje en el navegador — `datosBase64` se
 * rellena en cuanto se graba/adjunta (reproducción inmediata, sin esperar red) durante
 * la sesión en curso; `id` llega del servidor al mandar el turno, y es lo único
 * disponible al reconstruir un hilo antiguo (no hay `datosBase64` local en ese caso). */
export interface AdjuntoMensaje {
    id?: string;
    nombre: string;
    tipoMime: string;
    datosBase64?: string;
}

export interface MensajeAsistente {
    id: string;
    rol: "user" | "assistant";
    texto: string;
    adjuntos?: AdjuntoMensaje[];
}

/** GET /comun/ia/hilos: hilos (conversaciones) previos del usuario autenticado. */
export interface HiloIa {
    threadId: string;
    titulo: string;
    actualizadoEn: string;
    canal: CanalIa;
}

/** GET /comun/ia/hilos/{threadId}/mensajes: historial completo (texto + A2UI + adjuntos) de un hilo. */
export interface MensajeHiloIa {
    id: string;
    rol: "user" | "assistant";
    texto: string;
    a2uiMessages: unknown[];
    adjuntos: AdjuntoHiloIa[];
    /** Botones que en vivo llegan aparte del texto: también al reabrir el hilo, para
     * que no desaparezcan al recargar la página. */
    descarga: AccionDescarga | null;
    accionNavegacion: AccionNavegacion | null;
}

export interface MensajesHiloIa {
    threadId: string;
    mensajes: MensajeHiloIa[];
}

/** Modo voz (manos libres): escucha continua con frase de activación ("Oye Olula").
 * "inactivo" = modo desactivado; "en_espera" = escuchando solo la frase de activación. */
export type EstadoModoVoz =
    | "inactivo"
    | "en_espera"
    | "escuchando_orden"
    | "procesando"
    | "respondiendo"
    /** La respuesta pedía confirmar una acción (TarjetaConfirmacion): se espera un
     * "sí" o un "no" dicho en voz alta. */
    | "confirmando"
    | "error";

export type EventoModoVoz =
    | "activar"
    | "desactivar"
    | "frase_activacion"
    | "orden"
    | "silencio"
    | "respuesta"
    | "fin_respuesta"
    | "pedir_confirmacion"
    | "confirmacion"
    | "cancelar"
    | "fallo"
    | "reintentar";

export interface DeteccionActivacion {
    activado: boolean;
    /** Lo dicho a continuación de la frase de activación en la misma frase ("Oye Olula,
     * ¿cuántos pedidos tengo?" → "¿cuántos pedidos tengo?"); vacío si no hay nada. */
    orden: string;
}

/** Confirmación pendiente (TarjetaConfirmacion) que se puede resolver por voz. */
export interface ConfirmacionVoz {
    surfaceId: string;
    titulo: string;
    detalles: { etiqueta: string; valor: string }[];
}
