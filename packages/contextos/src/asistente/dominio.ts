import { puede } from "@olula/lib/dominio.ts";
import { ElementoMenu, ElementoMenuPadre } from "@olula/lib/menu.ts";
import type { AccionPantalla, DescripcionControl, DescripcionListado } from "@olula/lib/controles_pantalla.ts";
import { normalizarParaVoz } from "@olula/lib/voz/normalizar_voz.ts";
import {
    AccionDescarga, AccionNavegacion, Capacidad, EventoStreamIa, MensajeAsistente, RespuestaIa,
    HiloIa, MensajeHiloIa, MensajesHiloIa, AdjuntoHiloIa, AdjuntoIa, AdjuntoMensaje,
    CanalIa, ConfirmacionVoz, ContextoPantalla, DeteccionActivacion, EstadoModoVoz, EventoModoVoz,
} from "#/asistente/diseño.ts";

export const construirUrlNavegacion = (accion: AccionNavegacion): string => {
    // El LLM decide `ruta` en tiempo real (ver enlaceFila en el asistente) y a veces se
    // inventa un placeholder o query string propios (ej. "/ventas/pedido?id={id}") en
    // vez de una ruta limpia — se descarta cualquier "?..." que ya traiga para no acabar
    // con dos querystrings concatenadas.
    const ruta = accion.ruta.split("?")[0];
    if (!accion.parametros || Object.keys(accion.parametros).length === 0) return ruta;
    return `${ruta}?${new URLSearchParams(accion.parametros).toString()}`;
};

/** El backend puede devolver en `accion.descripcion` la descripción larga pensada para el
 * LLM en vez del nombre corto de pantalla acordado en el contrato (o no reconocer aún el
 * campo `nombre` de `Capacidad`) — las capacidades locales (derivadas del menú) son la
 * fuente de verdad para el nombre corto, así que se cruza por `ruta` y se sobreescribe con
 * ese nombre; solo si no hay coincidencia se conserva lo que mandó el backend. */
export const accionNavegacionConNombreCorto = (
    accion: AccionNavegacion, capacidades: Capacidad[]
): AccionNavegacion => {
    const ruta = accion.ruta.split("?")[0];
    const capacidad = capacidades.find(c => c.ruta === ruta);
    return capacidad ? { ...accion, descripcion: capacidad.nombre } : accion;
};

export const construirCapacidades = (menu: ElementoMenu[]): Capacidad[] => {
    const hojas = menu.flatMap(item =>
        "subelementos" in item ? (item as ElementoMenuPadre).subelementos : [item]
    );

    return hojas
        .filter(hoja => Boolean(hoja.descripcionIA))
        .filter(hoja => !hoja.regla || [hoja.regla].flat().some(puede))
        .map(hoja => ({
            ruta: hoja.url,
            nombre: hoja.nombre,
            descripcion: hoja.descripcionIA!,
            parametros: hoja.parametrosIA,
            regla: hoja.regla,
        }));
};

export const adjuntoHiloDesdeApi = (raw: Record<string, unknown>): AdjuntoHiloIa => ({
    id: String(raw.id ?? ""),
    nombre: String(raw.nombre ?? ""),
    tipoMime: String(raw.tipo_mime ?? ""),
});

export const descargaDesdeApi = (raw: unknown): AccionDescarga | null => {
    if (!raw || typeof raw !== "object") return null;
    const d = raw as Record<string, unknown>;
    if (!d.url) return null;
    return { url: String(d.url), nombreFichero: String(d.nombre_fichero ?? "") };
};

export const normalizarRespuestaIa = (raw: Record<string, unknown>): RespuestaIa => ({
    respuesta: String(raw.respuesta ?? ""),
    threadId: String(raw.thread_id ?? ""),
    a2uiMessages: Array.isArray(raw.a2ui_messages) ? raw.a2ui_messages : [],
    capacidadesHash: (raw.capacidades_hash as string | null | undefined) ?? null,
    necesitaCapacidades: Boolean(raw.necesita_capacidades),
    accionNavegacion: (raw.accion_navegacion as RespuestaIa["accionNavegacion"]) ?? null,
    descarga: descargaDesdeApi(raw.descarga),
    accionesPantalla: Array.isArray(raw.acciones_pantalla)
        ? raw.acciones_pantalla.flatMap(a => {
            const accion = accionPantallaDesdeApi(a);
            return accion ? [accion] : [];
        })
        : [],
    adjuntos: Array.isArray(raw.adjuntos)
        ? (raw.adjuntos as Record<string, unknown>[]).map(adjuntoHiloDesdeApi)
        : [],
    encolado: Boolean(raw.encolado),
});

export const mensajeVacio = (id: string, rol: MensajeAsistente["rol"]): MensajeAsistente => ({
    id,
    rol,
    texto: "",
});

/** Adjuntos locales (con datosBase64 en memoria) -> forma que espera ConsultaIa. Descarta
 * cualquier adjunto sin datosBase64 (no debería darse — un adjunto local siempre lo
 * tiene en el momento de enviarse) en vez de mandar un dato incompleto al backend. */
export const adjuntosParaEnviar = (adjuntos: AdjuntoMensaje[] | undefined): AdjuntoIa[] | undefined => {
    if (!adjuntos?.length) return undefined;
    const completos = adjuntos.filter((a): a is AdjuntoMensaje & { datosBase64: string } => Boolean(a.datosBase64));
    if (!completos.length) return undefined;
    return completos.map(a => ({ nombre: a.nombre, tipoMime: a.tipoMime, datosBase64: a.datosBase64 }));
};

const CANALES: CanalIa[] = ["web", "voz", "telegram", "tarea_programada"];

export const hiloDesdeApi = (raw: Record<string, unknown>): HiloIa => ({
    threadId: String(raw.thread_id ?? ""),
    titulo: String(raw.titulo ?? ""),
    actualizadoEn: String(raw.actualizado_en ?? ""),
    canal: CANALES.includes(raw.canal as CanalIa) ? (raw.canal as CanalIa) : "web",
});

export const mensajeHiloDesdeApi = (raw: Record<string, unknown>): MensajeHiloIa => ({
    id: String(raw.id ?? ""),
    rol: raw.rol === "user" ? "user" : "assistant",
    texto: String(raw.texto ?? ""),
    a2uiMessages: Array.isArray(raw.a2ui_messages) ? raw.a2ui_messages : [],
    adjuntos: Array.isArray(raw.adjuntos)
        ? (raw.adjuntos as Record<string, unknown>[]).map(adjuntoHiloDesdeApi)
        : [],
    descarga: descargaDesdeApi(raw.descarga),
    accionNavegacion: (raw.accion_navegacion as AccionNavegacion | null | undefined) ?? null,
});

export const mensajesHiloDesdeApi = (raw: Record<string, unknown>): MensajesHiloIa => ({
    threadId: String(raw.thread_id ?? ""),
    mensajes: Array.isArray(raw.mensajes)
        ? (raw.mensajes as Record<string, unknown>[]).map(mensajeHiloDesdeApi)
        : [],
});

export const eventoStreamDesdeApi = (raw: Record<string, unknown>): EventoStreamIa => {
    switch (raw.tipo) {
        case "delta":
            return { tipo: "delta", contenido: String(raw.contenido ?? "") };
        case "estado":
            return { tipo: "estado", contenido: String(raw.contenido ?? "") };
        case "a2ui":
            return { tipo: "a2ui", a2uiMessage: raw.a2ui_message };
        case "accion_navegacion":
            return { tipo: "accion_navegacion", accionNavegacion: raw.accion_navegacion as AccionNavegacion };
        case "accion_pantalla": {
            const accionPantalla = accionPantallaDesdeApi(raw.accion_pantalla);
            return accionPantalla
                ? { tipo: "accion_pantalla", accionPantalla }
                : { tipo: "error", contenido: "Acción de pantalla mal formada" };
        }
        case "descarga":
            return {
                tipo: "descarga",
                descarga: descargaDesdeApi(raw.descarga) ?? { url: "", nombreFichero: "" },
            };
        case "fin":
            return {
                tipo: "fin",
                threadId: String(raw.thread_id ?? ""),
                necesitaCapacidades: Boolean(raw.necesita_capacidades),
                adjuntos: Array.isArray(raw.adjuntos)
                    ? (raw.adjuntos as Record<string, unknown>[]).map(adjuntoHiloDesdeApi)
                    : [],
            };
        case "encolado":
            return {
                tipo: "encolado",
                threadId: String(raw.thread_id ?? ""),
                contenido: String(raw.contenido ?? ""),
            };
        case "error":
        default:
            return { tipo: "error", contenido: String(raw.contenido ?? "Error desconocido del asistente") };
    }
};

// ---------------------------------------------------------------------------
// Modo voz (manos libres)
// ---------------------------------------------------------------------------

/** El hilo de voz del usuario: el más reciente con canal "voz" (el backend devuelve
 * los hilos ordenados por actualización descendente), o null si aún no existe. */
export const hiloDeVoz = (hilos: HiloIa[]): HiloIa | null =>
    hilos.find(h => h.canal === "voz") ?? null;

/** Minúsculas, sin tildes ni signos de puntuación — para comparar palabras dictadas. */
export const normalizarPalabraVoz = (palabra: string): string =>
    palabra.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

const normalizarFraseVoz = (texto: string): string =>
    texto.split(/\s+/).map(normalizarPalabraVoz).filter(Boolean).join(" ");

const distanciaEdicion = (a: string, b: string): number => {
    const fila = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
        let diagonal = fila[0];
        fila[0] = i;
        for (let j = 1; j <= b.length; j++) {
            const arriba = fila[j];
            fila[j] = Math.min(fila[j] + 1, fila[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
            diagonal = arriba;
        }
    }
    return fila[b.length];
};

const NOMBRE_ASISTENTE = "olula";
/** Palabras con las que se suele llamar ("oye", y cómo lo transcribe a veces el
 * reconocedor: "hoy", "olle"…). */
const LLAMADAS = new Set(["oye", "oy", "hoy", "olle", "oiga", "hey", "ey", "eh"]);
/** "Olula" partido en dos por el reconocedor: "o lula", "hola lula", "u lula". */
const PARTICULAS_NOMBRE_PARTIDO = new Set(["o", "u", "ho", "hola"]);

const esNombreAsistente = (palabra: string): boolean =>
    palabra.length >= NOMBRE_ASISTENTE.length && distanciaEdicion(palabra, NOMBRE_ASISTENTE) <= 1;

/**
 * Busca la frase de activación ("Oye Olula") en lo dictado y devuelve lo que venga
 * detrás como orden. Tolerante con cómo lo transcribe el reconocedor: "olula" con una
 * letra distinta ("olura", "ulula"), o partido ("o lula", "hola lula", "oye lula").
 * Basta con el nombre: "Olula, ¿qué pedidos…?" también activa.
 */
export const detectarActivacion = (texto: string): DeteccionActivacion => {
    const palabras = texto.split(/\s+/).filter(Boolean);
    const normalizadas = palabras.map(normalizarPalabraVoz);

    const fin = normalizadas.findIndex((palabra, i) => {
        if (esNombreAsistente(palabra)) return true;
        const anterior = normalizadas[i - 1];
        return palabra === "lula" && anterior !== undefined
            && (PARTICULAS_NOMBRE_PARTIDO.has(anterior) || LLAMADAS.has(anterior));
    });
    if (fin === -1) return { activado: false, orden: "" };

    const orden = palabras.slice(fin + 1).join(" ").replace(/^[\s,.:;!-]+/, "").trim();
    return { activado: true, orden };
};

const COMANDOS_CANCELAR = new Set([
    "para", "parar", "para ya", "cancela", "cancelar", "calla", "callate", "silencio", "stop",
    "basta", "nada", "olvidalo", "dejalo", "da igual", "no importa",
]);

/** Orden de cortar lo que esté haciendo (escuchar, pensar o hablar). Solo si es TODO lo
 * dicho — "para el pedido de Juan" es una orden normal, no una cancelación. */
export const esComandoCancelar = (texto: string): boolean =>
    COMANDOS_CANCELAR.has(normalizarFraseVoz(texto));

const COMANDOS_DESACTIVAR = [
    "deja de escuchar", "desactivate", "desactiva el modo voz", "desactiva el modo de voz",
    "apaga el modo voz", "apaga el modo de voz", "apagate",
];

/** Orden de apagar el modo voz por completo. */
export const esComandoDesactivar = (texto: string): boolean => {
    const normalizado = normalizarFraseVoz(texto);
    return COMANDOS_DESACTIVAR.some(c => normalizado === c || normalizado.startsWith(`${c} `));
};

/** Componentes A2UI que piden algo al usuario (confirmar, rellenar, elegir) — por voz
 * no se pueden resolver todavía, hay que hacerlo en el chat. */
const COMPONENTES_A2UI_INTERACTIVOS = ["TarjetaConfirmacion", "Formulario", "ListaSeleccion"];

export const requiereInteraccion = (a2uiMessages: unknown[]): boolean => {
    if (!a2uiMessages.length) return false;
    const serializado = JSON.stringify(a2uiMessages);
    return COMPONENTES_A2UI_INTERACTIVOS.some(c => serializado.includes(`"${c}"`));
};

const LIMITE_CARACTERES_VOZ = 400;

const quitarMarkdown = (texto: string): string =>
    texto
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/https?:\/\/\S+/g, " ")
        .replace(/^\s*(?:[-•]|\d+\.)\s+/gm, "")
        .replace(/[*_`#>|~]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

const recortarParaVoz = (texto: string): { texto: string; recortado: boolean } => {
    if (texto.length <= LIMITE_CARACTERES_VOZ) return { texto, recortado: false };
    const trozo = texto.slice(0, LIMITE_CARACTERES_VOZ);
    const finFrase = Math.max(trozo.lastIndexOf(". "), trozo.lastIndexOf("? "), trozo.lastIndexOf("! "));
    if (finFrase > LIMITE_CARACTERES_VOZ / 3) return { texto: trozo.slice(0, finFrase + 1), recortado: true };
    return { texto: `${trozo.slice(0, trozo.lastIndexOf(" "))}…`, recortado: true };
};

/** Aviso para lo que solo se ve en pantalla (tablas, tarjetas) o que hay que completar
 * allí (formularios, listas de selección); vacío si no hay nada de eso. */
export const avisoContenidoEnPantalla = (a2uiMessages: unknown[], recortado: boolean): string =>
    requiereInteraccion(a2uiMessages)
        ? "Necesito que lo completes en el chat."
        : a2uiMessages.length
            ? "Te lo muestro en el chat."
            : recortado ? "Tienes el resto en el chat." : "";

/**
 * Texto que se lee en voz alta para una respuesta del asistente: sin markdown ni URLs,
 * acotado a unas pocas frases, y avisando cuando hay algo que solo se ve en pantalla
 * (tablas, tarjetas) o que hay que completar allí (confirmaciones, formularios).
 */
export const textoParaVoz = (respuesta: string, a2uiMessages: unknown[]): string => {
    const { texto, recortado } = recortarParaVoz(normalizarParaVoz(quitarMarkdown(respuesta)));
    return [texto, avisoContenidoEnPantalla(a2uiMessages, recortado)].filter(Boolean).join(" ") || "Hecho.";
};

/** Máximo de caracteres que se leen de una respuesta que llega por streaming — el resto
 * queda en el chat, igual que con textoParaVoz. */
export const LIMITE_CARACTERES_VOZ_STREAMING = 600;

// JSON, bloques A2UI o marcadores internos que se hayan colado en el texto: no se leen.
const PARECE_CODIGO = /[{}]|<\/?a2ui|\[(Resultado de|Datos que se mostraron)/;

/** Una frase suelta (streaming) preparada para leerla en voz alta; vacía si no hay
 * nada legible (código, JSON) — en ese caso no se lee. */
export const fraseParaVoz = (frase: string): string =>
    PARECE_CODIGO.test(frase) ? "" : normalizarParaVoz(quitarMarkdown(frase));

const MIN_PALABRAS_ECO = 3;
const PROPORCION_ECO = 0.6;

/**
 * ¿Lo reconocido es el propio asistente oyéndose por los altavoces? Se considera eco
 * si casi todas sus palabras están en lo que se está leyendo. Solo a partir de unas
 * pocas palabras: un "sí" o un "para" sueltos son del usuario aunque aparezcan en la
 * respuesta (si no, no se podría contestar ni interrumpir).
 */
export const esEcoDeVoz = (reconocido: string, leido: string): boolean => {
    const palabras = reconocido.split(/\s+/).map(normalizarPalabraVoz).filter(Boolean);
    if (palabras.length < MIN_PALABRAS_ECO) return false;
    const leidas = new Set(leido.split(/\s+/).map(normalizarPalabraVoz).filter(Boolean));
    const coincidentes = palabras.filter(p => leidas.has(p)).length;
    return coincidentes / palabras.length >= PROPORCION_ECO;
};

const AFIRMACIONES_CONFIRMACION = new Set([
    "si", "vale", "ok", "okay", "confirma", "confirmo", "confirmado", "adelante", "correcto",
    "afirmativo", "hazlo", "dale", "venga", "claro", "exacto", "perfecto", "procede",
]);
const NEGACIONES_CONFIRMACION = new Set([
    "no", "cancela", "cancelar", "cancelado", "negativo", "espera", "nada", "tampoco",
]);

/**
 * "Sí"/"no" dicho para confirmar una acción. Estricto a propósito (confirma
 * escrituras): por palabras completas — "casi" no es "sí" — y cualquier negación
 * gana ("sí, pero no" → no). null si no se entiende.
 */
export const parsearConfirmacionVoz = (texto: string): boolean | null => {
    const palabras = texto.split(/\s+/).map(normalizarPalabraVoz).filter(Boolean);
    if (palabras.some(p => NEGACIONES_CONFIRMACION.has(p))) return false;
    if (palabras.some(p => AFIRMACIONES_CONFIRMACION.has(p))) return true;
    return null;
};

/** La TarjetaConfirmacion que haya en la respuesta, si la hay. */
export const confirmacionPendiente = (a2uiMessages: unknown[]): ConfirmacionVoz | null => {
    for (const mensaje of a2uiMessages) {
        const actualizacion = (mensaje as { updateComponents?: { surfaceId?: unknown; components?: unknown } })
            ?.updateComponents;
        if (!actualizacion || !Array.isArray(actualizacion.components)) continue;
        const tarjeta = (actualizacion.components as Record<string, unknown>[])
            .find(c => c.component === "TarjetaConfirmacion");
        if (!tarjeta || typeof actualizacion.surfaceId !== "string") continue;
        const detalles = Array.isArray(tarjeta.detalles)
            ? (tarjeta.detalles as Record<string, unknown>[]).map(d => ({
                etiqueta: String(d.etiqueta ?? ""), valor: String(d.valor ?? ""),
            }))
            : [];
        return { surfaceId: actualizacion.surfaceId, titulo: String(tarjeta.titulo ?? ""), detalles };
    }
    return null;
};

const MAX_DETALLES_CONFIRMACION_VOZ = 4;

/** Pregunta que se lee para pedir la confirmación: qué se va a hacer y los datos
 * principales. Termina en "¿Lo confirmo?" (no "¿sí o no?": su eco se entendería). */
export const preguntaConfirmacionVoz = (confirmacion: ConfirmacionVoz): string => {
    const accion = confirmacion.titulo.replace(/^[¿\s]+|[?\s]+$/g, "");
    const detalles = confirmacion.detalles
        .filter(d => d.etiqueta && d.valor)
        .slice(0, MAX_DETALLES_CONFIRMACION_VOZ)
        .map(d => `${d.etiqueta}: ${normalizarParaVoz(d.valor)}.`)
        .join(" ");
    return [accion ? `${accion}.` : "", detalles, "¿Lo confirmo?"].filter(Boolean).join(" ");
};

/** Transiciones del modo voz. "desactivar" (→ inactivo) y "fallo" (→ error, problema
 * de micrófono) valen desde cualquier estado — ver siguienteEstadoModoVoz. */
export const maquinaModoVoz: Record<EstadoModoVoz, Partial<Record<EventoModoVoz, EstadoModoVoz>>> = {
    inactivo: { activar: "en_espera" },
    en_espera: { frase_activacion: "escuchando_orden", orden: "procesando" },
    escuchando_orden: { orden: "procesando", silencio: "en_espera", cancelar: "en_espera" },
    procesando: { respuesta: "respondiendo", cancelar: "en_espera" },
    // Tras responder se sigue escuchando un momento sin exigir la frase de activación,
    // para poder encadenar preguntas como en una conversación.
    respondiendo: { fin_respuesta: "escuchando_orden", pedir_confirmacion: "confirmando", cancelar: "en_espera" },
    // Si no llega un sí/no, la confirmación queda pendiente en el chat.
    confirmando: { confirmacion: "procesando", silencio: "en_espera", cancelar: "en_espera" },
    error: { reintentar: "en_espera" },
};

export const siguienteEstadoModoVoz = (estado: EstadoModoVoz, evento: EventoModoVoz): EstadoModoVoz => {
    if (evento === "desactivar") return "inactivo";
    if (evento === "fallo") return estado === "inactivo" ? estado : "error";
    return maquinaModoVoz[estado][evento] ?? estado;
};

/** El backend responde 404 "comun.ia.hilo: <id>" cuando el hilo no existe (p. ej. se
 * borró desde el historial) — RestAPI no expone el status, solo el texto del error. */
export const esErrorHiloNoEncontrado = (error: unknown): boolean =>
    typeof error === "object" && error !== null
    && String((error as { descripcion?: unknown }).descripcion ?? "").includes("comun.ia.hilo");

// ---------------------------------------------------------------------------
// Pantalla actual: contexto ("este pedido") y control por voz/chat
// ---------------------------------------------------------------------------

export const accionPantallaDesdeApi = (raw: unknown): AccionPantalla | null => {
    if (!raw || typeof raw !== "object") return null;
    const a = raw as Record<string, unknown>;
    if (typeof a.control !== "string" || typeof a.accion !== "string") return null;
    const parametros = a.parametros && typeof a.parametros === "object" ? a.parametros as Record<string, unknown> : {};
    return { control: a.control, accion: a.accion, parametros };
};

/** Qué tiene delante el usuario: ruta, registro abierto (?id=) y los controles
 * manejables montados. El nombre de la pantalla sale de las capacidades (menú). */
export const construirContextoPantalla = (
    ruta: string, busqueda: string, controles: DescripcionControl[], capacidades: Capacidad[],
): ContextoPantalla => {
    const idActivo = new URLSearchParams(busqueda).get("id");
    const listado = controles.find((c): c is DescripcionListado => c.tipo === "listado");
    const seleccionada = listado?.seleccionada;
    return {
        ruta,
        nombre: capacidades.find(c => c.ruta === ruta)?.nombre ?? null,
        idActivo,
        descripcionActivo: seleccionada && seleccionada.id === idActivo ? seleccionada.texto : null,
        controles,
    };
};

/** Descripción de un control para la API (snake_case). */
const controlAApi = (control: DescripcionControl): Record<string, unknown> => {
    switch (control.tipo) {
        case "listado":
            return {
                tipo: "listado", id: control.id, campos: control.campos,
                columnas_orden: control.columnasOrden, filtro: control.filtro, orden: control.orden,
                pagina: control.pagina, total: control.total, filas: control.filas,
                seleccionada: control.seleccionada, modo: control.modo, modos: control.modos,
            };
        case "pestanas":
            return { tipo: "pestanas", id: control.id, pestanas: control.pestanas, activa: control.activa };
        case "modal":
            return { tipo: "modal", id: control.id, titulo: control.titulo };
        case "detalle":
            return { tipo: "detalle", id: control.id };
    }
};

export const pantallaAApi = (pantalla: ContextoPantalla): Record<string, unknown> => ({
    ruta: pantalla.ruta,
    nombre: pantalla.nombre,
    id_activo: pantalla.idActivo,
    descripcion_activo: pantalla.descripcionActivo,
    controles: pantalla.controles.map(controlAApi),
});

const ORDINALES: Record<string, number> = {
    primero: 1, primera: 1, primer: 1, segundo: 2, segunda: 2, tercero: 3, tercera: 3, tercer: 3,
    cuarto: 4, cuarta: 4, quinto: 5, quinta: 5, sexto: 6, sexta: 6, septimo: 7, septima: 7,
    octavo: 8, octava: 8, noveno: 9, novena: 9, decimo: 10, decima: 10,
};
const NUMEROS: Record<string, number> = {
    uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
};
const numeroDicho = (palabra: string): number | undefined =>
    /^\d+$/.test(palabra) ? Number(palabra) : NUMEROS[palabra];

const VERBO_ABRIR = "(?:abre|abrir|abreme|selecciona|seleccionar|muestra|muestrame|ensename|ver|dame)";

/**
 * Órdenes de pantalla cerradas que se resuelven al momento, sin preguntar al
 * asistente: páginas, "abre el tercero", "el siguiente", quitar filtros, cambiar de
 * vista o de pestaña, cerrar. null si no es una de ellas (o no hay dónde aplicarla) —
 * entonces la orden va al asistente, que también puede manejar la pantalla.
 */
export const interpretarOrdenPantalla = (texto: string, controles: DescripcionControl[]): AccionPantalla | null => {
    const frase = normalizarFraseVoz(texto);
    if (!frase) return null;
    const listado = controles.find((c): c is DescripcionListado => c.tipo === "listado");
    const enListado = (accion: string, parametros: Record<string, unknown>): AccionPantalla | null =>
        listado ? { control: listado.id, accion, parametros } : null;

    if (/^(?:la )?(?:pagina siguiente|siguiente pagina|mas resultados)$/.test(frase)) {
        return enListado("pagina", { pagina: "siguiente" });
    }
    if (/^(?:la )?(?:pagina anterior|anterior pagina)$/.test(frase)) return enListado("pagina", { pagina: "anterior" });
    const pagina = /^(?:ve a |ir a |vete a )?(?:la )?pagina (\w+)$/.exec(frase);
    if (pagina && numeroDicho(pagina[1])) return enListado("pagina", { pagina: numeroDicho(pagina[1]) });

    const relativo = /^(?:(?:abre|ve a|ir a|pasa a) )?(?:el |la )?(siguiente|anterior)$/.exec(frase);
    if (relativo) {
        return listado?.seleccionada
            ? enListado("seleccionar", { relativa: relativo[1] })
            : enListado("pagina", { pagina: relativo[1] });
    }

    const ordinal = new RegExp(`^(?:${VERBO_ABRIR} )?(?:el |la )?(\\w+)(?: \\w+)?$`).exec(frase);
    if (ordinal && (ORDINALES[ordinal[1]] || ordinal[1] === "ultimo" || ordinal[1] === "ultima")) {
        const posicion = ORDINALES[ordinal[1]] ?? listado?.filas.length;
        return posicion ? enListado("seleccionar", { posicion }) : null;
    }
    const numeroRegistro = new RegExp(`^(?:${VERBO_ABRIR} )?(?:el |la )?numero (\\w+)$`).exec(frase);
    if (numeroRegistro && numeroDicho(numeroRegistro[1])) {
        return enListado("seleccionar", { posicion: numeroDicho(numeroRegistro[1]) });
    }

    if (/^(?:quita|quitar|borra|borrar|limpia|limpiar|elimina) (?:todos )?(?:los )?filtros$|^sin filtros$/.test(frase)) {
        return enListado("quitar_filtros", {});
    }

    const modo = /^(?:modo|vista|vista de|vista en|ver en|ver como|cambia a|pon la vista de) (tabla|tarjetas|kanban)$/.exec(frase);
    if (modo) return listado?.modos.includes(modo[1]) ? enListado("modo", { modo: modo[1] }) : null;

    const pestana = /^(?:(?:ve a|ir a|abre|cambia a|pasa a) )?(?:la )?pestana (?:de )?(.+)$/.exec(frase);
    if (pestana) {
        for (const control of controles) {
            if (control.tipo !== "pestanas") continue;
            const etiqueta = control.pestanas.find(p => normalizarFraseVoz(p) === pestana[1]);
            if (etiqueta) return { control: control.id, accion: "seleccionar", parametros: { pestana: etiqueta } };
        }
        return null;
    }

    if (/^(?:cierra|cerrar|cierralo|cierrala)(?: (?:la ventana|el modal|esto|eso))?$/.test(frase)) {
        const modal = [...controles].reverse().find(c => c.tipo === "modal");
        const detalle = controles.find(c => c.tipo === "detalle");
        const destino = modal ?? detalle;
        return destino ? { control: destino.id, accion: "cerrar", parametros: {} } : null;
    }
    if (/^(?:cierra|cerrar) (?:el detalle|la ficha)$/.test(frase)) {
        const detalle = controles.find(c => c.tipo === "detalle");
        return detalle ? { control: detalle.id, accion: "cerrar", parametros: {} } : null;
    }
    return null;
};

// ---------------------------------------------------------------------------
// Avisos hablados (comunicaciones nuevas mientras el modo voz está activo)
// ---------------------------------------------------------------------------

// Asuntos con los que el backend avisa del fin de un turno largo del asistente
// (aplicacion_turno_largo.py, _PREFIJO_ASUNTO_POR_ESTADO).
const AVISOS_ASISTENTE: [string, string][] = [
    ["Tu consulta ya está lista", "Ya tengo la respuesta a tu consulta. La tienes en el chat."],
    ["Tu consulta requiere confirmación", "Tu consulta necesita que confirmes una acción en el chat."],
    ["Tu consulta ha fallado", "Tu consulta al asistente ha fallado."],
];

const MAX_ASUNTO_AVISO = 120;

/** Lo que se dice al llegar una comunicación nueva. */
export const textoAvisoComunicacion = (asunto: string): string => {
    const limpio = asunto.trim();
    const delAsistente = AVISOS_ASISTENTE.find(([prefijo]) => limpio.startsWith(prefijo));
    if (delAsistente) return delAsistente[1];
    if (!limpio) return "Tienes un aviso nuevo.";
    const corto = limpio.length > MAX_ASUNTO_AVISO ? `${limpio.slice(0, MAX_ASUNTO_AVISO)}…` : limpio;
    return `Tienes un aviso nuevo: ${normalizarParaVoz(corto)}.`;
};
