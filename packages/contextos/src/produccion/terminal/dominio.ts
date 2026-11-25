import { ClausulaFiltro } from "@olula/lib/diseño.ts";
import { cantidadDesdeTexto, formatearCantidad } from "../orden/dominio.ts";
import {
    ComponenteTerminal,
    ConfigTerminal,
    ConsumoApi,
    CuerpoDeclarar,
    CuerpoEditarTramo,
    LineaConsumo,
    TareaTerminal,
    TramoTerminal,
    TrabajadorLeido,
} from "./diseño.ts";

// ---------------------------------------------------------------------------------------------
// Códigos leídos y atajos del teclado numérico (`formatearCodigo` y `lanzarTarea` de Eneboo)
// ---------------------------------------------------------------------------------------------

/** Dígitos de la parte numérica de un código de tarea (`TA` + 6). */
export const DIGITOS_TAREA = 6;

/**
 * Código de tarea normalizado: en mayúsculas y, si es prefijo de dos letras más dígitos,
 * con ceros a la izquierda hasta 6 dígitos ("ta12" → "TA000012"). Solo dígitos: con «TA».
 */
export const formatearCodigoTarea = (texto: string): string => {
    const limpio = texto.trim().toUpperCase().replace(/\s+/g, "");
    if (limpio === "") return "";
    const conPrefijo = /^\d+$/.test(limpio) ? `TA${limpio}` : limpio;
    const partes = /^([A-Z]{2})(\d{1,6})$/.exec(conPrefijo);
    return partes ? `${partes[1]}${partes[2].padStart(DIGITOS_TAREA, "0")}` : conPrefijo;
};

export type ResultadoAtajo =
    /** La tecla no es un atajo: el campo la escribe. */
    | { tipo: "ninguno" }
    /** El campo pasa a tener `valor`. */
    | { tipo: "valor"; valor: string }
    /** `/`: se limpian el operario y la tarea. */
    | { tipo: "limpiar" };

/**
 * Atajos del campo de tarea: `/` limpia operario y tarea, `*` escribe «TA» (en lugar de lo
 * que hubiera) y `.` rellena con ceros hasta 6 dígitos.
 */
export const atajoTarea = (valor: string, tecla: string): ResultadoAtajo => {
    if (tecla === "/") return { tipo: "limpiar" };
    if (tecla === "*") return { tipo: "valor", valor: "TA" };
    if (tecla === ".") return { tipo: "valor", valor: formatearCodigoTarea(valor) };
    return { tipo: "ninguno" };
};

/** Atajos del campo de operario: solo `/` (limpiar). */
export const atajoOperario = (tecla: string): ResultadoAtajo =>
    tecla === "/" ? { tipo: "limpiar" } : { tipo: "ninguno" };

/** Por qué no vale el operario leído, o `null` si vale. */
export const motivoOperarioNoValido = (t: TrabajadorLeido): string | null => {
    if (!t.existe) return `El operario ${t.codigo} no existe`;
    if (t.deBaja) return `El operario ${t.codigo}${t.nombre ? ` (${t.nombre})` : ""} está de baja`;
    return null;
};

// ---------------------------------------------------------------------------------------------
// Qué hace el Terminal con la tarea leída (`produccion4_lanzarTarea`)
// ---------------------------------------------------------------------------------------------

export type AccionTerminal =
    | { tipo: "iniciar"; texto: string }
    | { tipo: "consumos"; texto: string }
    | { tipo: "ninguna"; motivo: string };

/**
 * PTE o EN PAUSA: iniciar (si termina en un paso, el servidor la termina a la vez). EN CURSO:
 * la pantalla de consumos (con tramos, para pausar o terminar; sin tramos, para declarar y
 * terminar). OFF y TERMINADA: nada.
 */
export const accionTerminal = (
    tarea: Pick<TareaTerminal, "id" | "estado" | "terminaEnUnPaso">,
    config: Pick<ConfigTerminal, "usarTramos">,
): AccionTerminal => {
    switch (tarea.estado) {
        case "PTE":
        case "EN PAUSA": {
            const verbo = tarea.estado === "PTE" ? "Iniciar" : "Reanudar";
            return { tipo: "iniciar", texto: tarea.terminaEnUnPaso ? `${verbo} y terminar` : verbo };
        }
        case "EN CURSO":
            return { tipo: "consumos", texto: config.usarTramos ? "Declarar producción" : "Declarar y terminar" };
        case "TERMINADA":
            return { tipo: "ninguna", motivo: `La tarea ${tarea.id} ya está terminada` };
        default:
            return { tipo: "ninguna", motivo: `La tarea ${tarea.id} no está activa` };
    }
};

/** Pendiente de la tarea: lo del lote menos lo declarado (no negativo). */
export const cantidadPendienteTarea = (t: Pick<TareaTerminal, "cantidad" | "cantidadHecha">): number =>
    Math.max(0, redondear((t.cantidad ?? 0) - (t.cantidadHecha ?? 0)));

// ---------------------------------------------------------------------------------------------
// Máquina de pasos del Terminal
// ---------------------------------------------------------------------------------------------

export type PasoTerminal = "operario" | "tarea" | "consumos";

export type MensajeTerminal = { tipo: "exito" | "error" | "aviso"; texto: string };

/** Lo que se declara en la pantalla de consumos: un tramo nuevo o la edición de uno. */
export type ModoConsumos = { tipo: "declarar" } | { tipo: "editar"; tramo: TramoTerminal };

export interface EstadoTerminal {
    paso: PasoTerminal;
    operario: { codigo: string; nombre: string } | null;
    mantenerOperario: boolean;
    tarea: TareaTerminal | null;
    modo: ModoConsumos | null;
    /** Última tarea procesada con éxito (para «Deshacer»). */
    ultima: { id: string; descripcion: string } | null;
    mensaje: MensajeTerminal | null;
}

export type EventoTerminal =
    | { tipo: "operario_leido"; codigo: string; nombre: string }
    | { tipo: "tarea_leida"; tarea: TareaTerminal }
    | { tipo: "tarea_recargada"; tarea: TareaTerminal }
    | { tipo: "abrir_consumos"; modo: ModoConsumos }
    | { tipo: "cerrar_consumos" }
    | { tipo: "procesada"; tarea: { id: string; descripcion: string }; texto: string }
    | { tipo: "deshecha"; texto: string }
    /** Éxito que no termina el trabajo con la tarea (editar o borrar un tramo): se queda leída. */
    | { tipo: "exito"; texto: string }
    | { tipo: "error"; texto: string }
    | { tipo: "aviso"; texto: string }
    | { tipo: "limpiar_mensaje" }
    | { tipo: "limpiar" }
    | { tipo: "mantener_operario"; valor: boolean };

export const estadoTerminalInicial = (mantenerOperario = false): EstadoTerminal => ({
    paso: "operario",
    operario: null,
    mantenerOperario,
    tarea: null,
    modo: null,
    ultima: null,
    mensaje: null,
});

/** Tras procesar: sin tarea y, salvo «Mantener operario», sin operario. */
const limpiarTrasExito = (e: EstadoTerminal): EstadoTerminal => {
    const operario = e.mantenerOperario ? e.operario : null;
    return { ...e, operario, tarea: null, modo: null, paso: operario ? "tarea" : "operario" };
};

/**
 * Transiciones del Terminal: operario → tarea → (consumos) → tarea u operario. Sin operario
 * no se lee tarea; un error deja el paso como estaba, con el mensaje.
 */
export const transicionTerminal = (e: EstadoTerminal, ev: EventoTerminal): EstadoTerminal => {
    switch (ev.tipo) {
        case "operario_leido":
            return { ...e, operario: { codigo: ev.codigo, nombre: ev.nombre }, tarea: null, modo: null, paso: "tarea", mensaje: null };
        case "tarea_leida":
            if (!e.operario) return { ...e, mensaje: { tipo: "error", texto: "Lea primero el código del operario" } };
            return { ...e, tarea: ev.tarea, modo: null, paso: "tarea", mensaje: null };
        case "tarea_recargada":
            return e.tarea && e.tarea.id === ev.tarea.id ? { ...e, tarea: ev.tarea } : e;
        case "abrir_consumos":
            if (!e.operario || !e.tarea) return e;
            return { ...e, paso: "consumos", modo: ev.modo, mensaje: null };
        case "cerrar_consumos":
            return { ...e, paso: e.operario ? "tarea" : "operario", modo: null };
        case "procesada":
            return { ...limpiarTrasExito(e), ultima: ev.tarea, mensaje: { tipo: "exito", texto: ev.texto } };
        case "deshecha":
            return { ...limpiarTrasExito(e), ultima: null, mensaje: { tipo: "exito", texto: ev.texto } };
        case "exito":
            return { ...e, paso: e.operario ? "tarea" : "operario", modo: null, mensaje: { tipo: "exito", texto: ev.texto } };
        case "error":
            return { ...e, mensaje: { tipo: "error", texto: ev.texto } };
        case "aviso":
            return { ...e, mensaje: { tipo: "aviso", texto: ev.texto } };
        case "limpiar_mensaje":
            return { ...e, mensaje: null };
        case "limpiar":
            return { ...e, operario: null, tarea: null, modo: null, paso: "operario", mensaje: null };
        case "mantener_operario":
            return { ...e, mantenerOperario: ev.valor };
    }
};

// ---------------------------------------------------------------------------------------------
// Pantalla de consumos (`pr4_selectlotetarea`): previstos, validación y cuerpo de los comandos
// ---------------------------------------------------------------------------------------------

/** Redondeo a 6 decimales para quitar los restos de la coma flotante (0.1 × 3). */
export const redondear = (n: number, decimales = 6): number => {
    const f = 10 ** decimales;
    return Math.round(n * f) / f;
};

/** Previsto de un componente en el tramo: cantidad a fabricar × cantidad por unidad. */
export const previstoTramo = (cantidad: number | null, componente: Pick<ComponenteTerminal, "cantidadUnidad">): number =>
    redondear(Math.max(0, cantidad ?? 0) * componente.cantidadUnidad);

/** Líneas iniciales de la pantalla: sin lotes leídos, cantidades siguiendo a lo previsto. */
export const lineasIniciales = (componentes: ComponenteTerminal[]): LineaConsumo[] =>
    componentes.map((componente) => ({ componente, cantidad: null, lotes: [], cerrado: false }));

/** Lo que se declara de la línea en el tramo (por lotes, la suma de los leídos). */
export const consumoLinea = (linea: LineaConsumo, cantidadTramo: number | null): number => {
    if (linea.componente.porLotes)
        return redondear(linea.lotes.reduce((s, l) => s + (cantidadDesdeTexto(l.cantidad) ?? 0), 0));
    if (linea.cantidad === null) return previstoTramo(cantidadTramo, linea.componente);
    return cantidadDesdeTexto(linea.cantidad) ?? 0;
};

/** Lo que aún falta por leer de una línea por lotes en el tramo (no negativo). */
export const faltaLinea = (linea: LineaConsumo, cantidadTramo: number | null): number =>
    Math.max(0, redondear(previstoTramo(cantidadTramo, linea.componente) - consumoLinea(linea, cantidadTramo)));

/**
 * Cantidad que se propone al leer un lote: lo que falta del tramo, sin pasar de lo disponible
 * del lote si tiene; si no falta nada, 0 (el campo queda vacío para teclearla).
 */
export const cantidadPropuestaLote = (falta: number, disponible: number): number => {
    if (falta <= 0) return 0;
    return disponible > 0 ? Math.min(falta, disponible) : falta;
};

export type ResultadoLoteLeido =
    | { ok: true; lineas: LineaConsumo[]; componenteId: string }
    | { ok: false; motivo: string };

/** Añade un lote leído a su línea (la del componente que dice el servidor). */
export const anadirLoteLeido = (
    lineas: LineaConsumo[],
    lote: { id: string; articuloId: string; componenteId: string; disponible: number },
    cantidadTramo: number | null,
): ResultadoLoteLeido => {
    const linea = lineas.find((l) => l.componente.componenteId === lote.componenteId);
    if (!lote.componenteId || !linea)
        return { ok: false, motivo: `El lote ${lote.id} (${lote.articuloId}) no es de ningún componente de esta tarea` };
    if (!linea.componente.porLotes)
        return { ok: false, motivo: `El componente ${linea.componente.articuloId} no se consume por lotes` };
    if (linea.lotes.some((l) => l.loteId === lote.id))
        return { ok: false, motivo: `El lote ${lote.id} ya está leído` };
    const cantidad = cantidadPropuestaLote(faltaLinea(linea, cantidadTramo), lote.disponible);
    const nueva: LineaConsumo = {
        ...linea,
        lotes: [...linea.lotes, { loteId: lote.id, cantidad: cantidad > 0 ? textoCantidad(cantidad) : "" }],
    };
    return { ok: true, componenteId: linea.componente.componenteId, lineas: lineas.map((l) => (l === linea ? nueva : l)) };
};

/** Número en texto para un campo (coma decimal, sin miles): 12.5 → "12,5". */
export const textoCantidad = (n: number): string => String(redondear(n)).replace(".", ",");

const decimalesDe = (n: number): number => {
    const texto = String(redondear(n, 9));
    const punto = texto.indexOf(".");
    return punto < 0 ? 0 : texto.length - punto - 1;
};

export interface ValidacionConsumos {
    /** Impiden enviar. */
    errores: string[];
    /** Componentes por debajo del mínimo sin cerrar (el servidor los rechazará). */
    bajoMinimo: string[];
}

/** Si la línea queda por debajo del mínimo de lo previsto del tramo (y no está cerrada). */
export const lineaBajoMinimo = (linea: LineaConsumo, cantidadTramo: number | null): boolean => {
    if (linea.cerrado) return false;
    const previsto = previstoTramo(cantidadTramo, linea.componente);
    if (previsto <= 0) return false;
    return consumoLinea(linea, cantidadTramo) < redondear(previsto * linea.componente.minimo / 100);
};

/** Por qué no vale la cantidad a fabricar del tramo (decimales y máximo de la configuración). */
export const motivoCantidadTramo = (
    texto: string,
    config: Pick<ConfigTerminal, "decimales" | "maximoTramo">,
): string | null => {
    if (texto.trim() === "") return "Indique la cantidad a fabricar";
    const cantidad = cantidadDesdeTexto(texto);
    if (cantidad === null) return "La cantidad a fabricar ha de ser un número";
    if (cantidad <= 0) return "La cantidad a fabricar ha de ser mayor que cero";
    if (decimalesDe(cantidad) > config.decimales)
        return config.decimales === 0
            ? "La cantidad a fabricar no admite decimales"
            : `La cantidad a fabricar admite como máximo ${config.decimales} decimales`;
    if (config.maximoTramo !== null && cantidad > config.maximoTramo)
        return `La cantidad a fabricar no puede pasar de ${formatearCantidad(config.maximoTramo)}`;
    return null;
};

/** Validación de la pantalla antes de enviar: errores que impiden enviar y avisos de mínimo. */
export const validarConsumos = (
    cantidadTexto: string,
    lineas: LineaConsumo[],
    config: Pick<ConfigTerminal, "decimales" | "maximoTramo">,
): ValidacionConsumos => {
    const errores: string[] = [];
    const motivo = motivoCantidadTramo(cantidadTexto, config);
    if (motivo) errores.push(motivo);
    const cantidad = cantidadDesdeTexto(cantidadTexto);
    const bajoMinimo: string[] = [];
    for (const linea of lineas) {
        const ref = linea.componente.articuloId;
        if (linea.componente.porLotes) {
            for (const lote of linea.lotes) {
                const c = cantidadDesdeTexto(lote.cantidad);
                if (c === null || c <= 0) errores.push(`${ref}: la cantidad del lote ${lote.loteId} ha de ser mayor que cero`);
            }
        } else if (linea.cantidad !== null) {
            const c = cantidadDesdeTexto(linea.cantidad);
            if (c === null || c < 0) errores.push(`${ref}: la cantidad consumida ha de ser un número no negativo`);
        }
        if (!motivo && lineaBajoMinimo(linea, cantidad)) {
            const previsto = previstoTramo(cantidad, linea.componente);
            bajoMinimo.push(
                `${ref}: ${formatearCantidad(consumoLinea(linea, cantidad))} de ${formatearCantidad(previsto)} previstos ` +
                `(mínimo ${formatearCantidad(linea.componente.minimo)} %)`,
            );
        }
    }
    return { errores, bajoMinimo };
};

const consumosApi = (lineas: LineaConsumo[], cantidad: number): ConsumoApi[] =>
    lineas.map((linea) => {
        const base: ConsumoApi = { componente_id: linea.componente.componenteId };
        if (linea.componente.porLotes)
            base.lotes = linea.lotes.map((l) => ({ lote_id: l.loteId, cantidad: cantidadDesdeTexto(l.cantidad) ?? 0 }));
        else base.cantidad = consumoLinea(linea, cantidad);
        if (linea.cerrado) base.cerrado = true;
        return base;
    });

/** Cuerpo de `POST /produccion/tarea/<id>/declarar`. */
export const cuerpoDeclarar = (
    cantidadTexto: string,
    lineas: LineaConsumo[],
    trabajadorId: string | null | undefined,
    terminar: boolean,
): CuerpoDeclarar => {
    const cantidad = cantidadDesdeTexto(cantidadTexto) ?? 0;
    return {
        cantidad,
        ...(trabajadorId ? { trabajador_id: trabajadorId } : {}),
        terminar,
        consumos: consumosApi(lineas, cantidad),
    };
};

/** Cuerpo de `PATCH /produccion/tarea/<id>/tramo/<tramo>` (como declarar, sin `terminar`). */
export const cuerpoEditarTramo = (
    cantidadTexto: string,
    lineas: LineaConsumo[],
    trabajadorId: string | null | undefined,
): CuerpoEditarTramo => {
    const { terminar: _terminar, ...resto } = cuerpoDeclarar(cantidadTexto, lineas, trabajadorId, false);
    void _terminar;
    return resto;
};

/**
 * Líneas precargadas con los movimientos de un tramo (para editarlo): por lotes, sus lotes con
 * lo consumido; sin lotes, la suma. Una línea que quedó por debajo del mínimo se precarga
 * cerrada si se puede cerrar (el servidor solo la aceptó así).
 */
export const lineasDeTramo = (componentes: ComponenteTerminal[], tramo: TramoTerminal): LineaConsumo[] =>
    componentes.map((componente) => {
        const movs = tramo.movimientos.filter((m) => m.componenteId === componente.componenteId);
        const linea: LineaConsumo = componente.porLotes
            ? {
                componente,
                cantidad: null,
                lotes: movs.filter((m) => m.loteId).map((m) => ({ loteId: m.loteId, cantidad: textoCantidad(-m.cantidad) })),
                cerrado: false,
            }
            : { componente, cantidad: textoCantidad(-movs.reduce((s, m) => s + m.cantidad, 0)), lotes: [], cerrado: false };
        return componente.puedeCerrar && lineaBajoMinimo(linea, tramo.cantidad) ? { ...linea, cerrado: true } : linea;
    });

/** Cantidad a fabricar propuesta: lo pendiente de la tarea sin pasar del máximo por tramo. */
export const cantidadPropuestaTramo = (pendiente: number, config: Pick<ConfigTerminal, "maximoTramo">): string => {
    if (pendiente <= 0) return "";
    const c = config.maximoTramo !== null ? Math.min(pendiente, config.maximoTramo) : pendiente;
    return textoCantidad(c);
};

// ---------------------------------------------------------------------------------------------
// Mensajes y lista lateral
// ---------------------------------------------------------------------------------------------

const PREFIJOS_ESTADO: Record<number, string> = {
    400: "No válido",
    403: "Sin permiso",
    404: "No encontrado",
    409: "No se puede",
    422: "Faltan datos",
};

/**
 * Texto de un error de la API para el mensaje grande: el motivo del servidor (texto plano, o
 * el `detail` de FastAPI) precedido de lo que significa el código.
 */
export const textoError = (error: unknown): string => {
    const e = (error ?? {}) as { estado?: number; descripcion?: unknown; message?: string; nombre?: string };
    let motivo = typeof e.descripcion === "string" ? e.descripcion : e.message ?? e.nombre ?? "Error";
    try {
        const json = JSON.parse(motivo);
        const detalle = json?.detail ?? json?.descripcion ?? json;
        motivo = Array.isArray(detalle)
            ? detalle.map((d) => (typeof d === "string" ? d : [d?.loc?.slice(-1)[0], d?.msg].filter(Boolean).join(": "))).join("\n")
            : typeof detalle === "string" ? detalle : motivo;
    } catch {
        // Texto plano.
    }
    motivo = motivo.trim().replace(/^"(.*)"$/s, "$1");
    const prefijo = e.estado ? PREFIJOS_ESTADO[e.estado] : undefined;
    return prefijo ? `${prefijo}: ${motivo}` : motivo;
};

/** Estados de las tareas de la lista lateral. */
export const ESTADOS_LISTA_TERMINAL = ["PTE", "EN CURSO", "EN PAUSA"];

/** Filtro de la lista lateral: pendientes, en curso y en pausa; si hay puesto, de su centro. */
export const filtroListaTerminal = (centroId: string | null): ClausulaFiltro[] => [
    ["estado", "in", ESTADOS_LISTA_TERMINAL as unknown as string],
    ...(centroId ? [["centro_id", "=", centroId] as ClausulaFiltro] : []),
];

/** Clave de `localStorage` del centro de coste del puesto. */
export const CLAVE_CENTRO_PUESTO = "olula.produccion.terminal.centro";

/**
 * ¿Se pregunta «¿Imprimir etiqueta?» tras procesar la tarea? Solo en la tarea final (la que da
 * el producto del lote) y cuando se ha declarado algo: al terminar o pausar con un tramo, o al
 * iniciar una tarea que se termina en un paso. Al iniciar o reanudar sin terminar, no.
 */
export const preguntarEtiqueta = (
    tarea: { final: boolean },
    procesada: "terminar" | "pausar" | "guardar" | "iniciada" | "terminada_en_un_paso",
): boolean => tarea.final && (procesada === "terminar" || procesada === "pausar" || procesada === "terminada_en_un_paso");

/** Nombre del PDF de la etiqueta de una tarea (el que da el servidor). */
export const nombreEtiquetaTarea = (id: string): string => `etiqueta-${id}.pdf`;
