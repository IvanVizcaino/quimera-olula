import { validarReposicionPickingFijo } from "#/almacen/picking_fijo/dominio.ts";
import {
    ClasesPicking, FilaPickingFijo, OrigenRotacion, PropuestaPickingFijo, PropuestaUbicacion, Recolocacion, ResultadoMigracion,
} from "./diseño.ts";

export const DIAS_POR_DEFECTO = 90;
export const LIMITE_PROPUESTA_POR_DEFECTO = 5;
export const LIMITE_RECOLOCACION_POR_DEFECTO = 20;

export const ORIGEN_POR_DEFECTO: OrigenRotacion = "ORDENES";

export const origenesRotacion: { valor: OrigenRotacion; descripcion: string }[] = [
    { valor: "ORDENES", descripcion: "Órdenes de salida" },
    { valor: "VENTAS", descripcion: "Ventas (albaranes)" },
];

/** El valor del selector, o el origen por defecto si no es uno conocido. */
export const origenRotacion = (valor: string | null | undefined): OrigenRotacion =>
    origenesRotacion.find((o) => o.valor === valor)?.valor ?? ORIGEN_POR_DEFECTO;

export const propuestaVacia: PropuestaUbicacion = { articuloId: "", clase: "C", ubicaciones: [] };

/** Entero positivo a partir del texto de un input; si no es válido, el valor por defecto. */
export const enteroPositivo = (texto: string, porDefecto: number): number => {
    const n = parseInt(texto, 10);
    return isNaN(n) || n < 1 ? porDefecto : n;
};

/** Construye la query string a partir de los parámetros no vacíos. */
export const construirQuery = (parametros: Record<string, string | number | null | undefined>): string => {
    const partes = Object.entries(parametros)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    return partes.length ? `?${partes.join("&")}` : "";
};

/** Texto de "con quién o adónde" de una recolocación. */
export const textoDestinoRecolocacion = (r: Pick<Recolocacion, "accion" | "conArticuloId" | "conUbicacion">): string => {
    if (r.accion === "INTERCAMBIAR") {
        return `con ${r.conArticuloId ?? "?"} (${r.conUbicacion ?? "?"})`;
    }
    return r.conUbicacion ? `a ${r.conUbicacion}` : "";
};

export const COBERTURA_POR_DEFECTO = 5;
export const REPOSICION_POR_DEFECTO = 1;
export const CLASES_PICKING_POR_DEFECTO: ClasesPicking = "AB";

export const clasesPicking: { valor: ClasesPicking; descripcion: string }[] = [
    { valor: "A", descripcion: "Solo A" },
    { valor: "AB", descripcion: "A y B" },
];

/** El valor del selector, o "AB" si no es uno conocido. */
export const clasesPickingValidas = (valor: string | null | undefined): ClasesPicking =>
    clasesPicking.find((c) => c.valor === valor)?.valor ?? CLASES_PICKING_POR_DEFECTO;

/** Fila editable a partir de la propuesta: marcada por defecto solo si tiene ubicación. */
export const filaPickingDesdePropuesta = (p: PropuestaPickingFijo): FilaPickingFijo => ({
    ...p,
    seleccionada: tieneUbicacionPicking(p),
    estado: "PENDIENTE",
    errorCreacion: null,
});

export const tieneUbicacionPicking = (p: Pick<PropuestaPickingFijo, "ubicacionId">): boolean =>
    p.ubicacionId !== null && p.ubicacionId !== "";

/** Mensaje de validación de la fila (cantidades), o null si es válida. */
export const errorValidacionFila = (f: Pick<FilaPickingFijo, "minimo" | "maximo" | "unidadReposicion">): string | null => {
    const r = validarReposicionPickingFijo(f);
    return r === true ? null : r;
};

/** Una fila ya creada, sin hueco o con cantidades inválidas no se puede crear. */
export const puedeCrearFilaPicking = (f: FilaPickingFijo): boolean =>
    f.estado !== "CREADO" && tieneUbicacionPicking(f) && errorValidacionFila(f) === null;

/** Filas marcadas que se pueden crear. */
export const filasPickingACrear = (filas: FilaPickingFijo[]): FilaPickingFijo[] =>
    filas.filter((f) => f.seleccionada && puedeCrearFilaPicking(f));

/** Texto "Creados N de M" tras intentar crear M filas. */
export const resumenCreacionPicking = (filas: FilaPickingFijo[], intentadas: number): string =>
    `Creados ${filas.filter((f) => f.estado === "CREADO").length} de ${intentadas}`;

/** Mensaje legible de un error de la API ({ nombre, descripcion } con cuerpo JSON o texto). */
export const mensajeErrorApi = (e: unknown): string => {
    if (typeof e === "object" && e !== null) {
        const { nombre, descripcion } = e as { nombre?: string; descripcion?: string };
        if (descripcion) {
            try {
                const j = JSON.parse(descripcion) as { detail?: unknown; mensaje?: unknown };
                const m = j.detail ?? j.mensaje;
                if (typeof m === "string") return m;
            } catch {
                return descripcion;
            }
        }
        if (nombre) return nombre;
        if (e instanceof Error) return e.message;
    }
    return "Error al crear picking fijo";
};

/** Las filas que se pueden marcar: con hueco y aún sin crear. */
export const filaPickingMarcable = (f: Pick<FilaPickingFijo, "ubicacionId" | "estado">): boolean =>
    !!f.ubicacionId && f.estado !== "CREADO";

/** Si están marcadas todas las que se pueden marcar (y hay alguna). */
export const todasPickingMarcadas = (filas: FilaPickingFijo[]): boolean => {
    const marcables = filas.filter(filaPickingMarcable);
    return marcables.length > 0 && marcables.every((f) => f.seleccionada);
};

/** Marca todas las que se pueden marcar, o desmarca todas. */
export const marcarTodasPicking = (filas: FilaPickingFijo[], marcar: boolean): FilaPickingFijo[] =>
    filas.map((f) => ({ ...f, seleccionada: marcar && filaPickingMarcable(f) }));

/** Cómo se obtiene la clasificación ABC, para explicarlo en la pantalla. */
export const explicacionAbc = (origen: OrigenRotacion, dias: number): string[] => [
    origen === "VENTAS"
        ? `Cuenta cuántas líneas de albarán de venta tiene cada artículo en este almacén en los últimos ${dias} días (cada línea es un envío; las devoluciones no cuentan).`
        : `Cuenta cuántas líneas de órdenes de salida del SGA, con algo recogido, tiene cada artículo en este almacén en los últimos ${dias} días.`,
    "Se cuentan visitas al hueco (líneas), no unidades: es lo que cuesta tiempo al preparar.",
    "Ordenados de más a menos líneas: A son los que suman el primer 80 % de las líneas, B los siguientes hasta el 95 % y C el resto, incluidos los que tienen stock y no han salido.",
    "No entran los artículos sin stock (servicios, portes, gastos). La clasificación no se guarda: se calcula cada vez.",
];

/** Resumen del resultado de la migración. */
export const resumenMigracion = (r: ResultadoMigracion): string => {
    if (r.ajustes.length === 0) return "No hay nada que ubicar: todo el stock del almacén ya está en ubicaciones.";
    const partes = [`${r.lineasUbicadas} líneas a ubicar (${r.unidadesUbicadas} unidades)`];
    if (r.lineasRetiradas) partes.push(`${r.lineasRetiradas} a retirar (${r.unidadesRetiradas} unidades)`);
    return `${r.simulado ? "Simulación" : "Hecho"}: ${partes.join(", ")}.`;
};

/** Se puede ubicar tras una simulación con algo que hacer. */
export const puedeUbicarMigracion = (r: ResultadoMigracion | null): boolean =>
    !!r && r.simulado && r.ajustes.length > 0;

/** Cómo se calculan mínimo, máximo y unidad de la propuesta de picking fijo. */
export const explicacionCantidadesPicking = (cobertura: number, reposicion: number): string[] => [
    "Consumo diario: unidades del periodo entre los días laborables (5 de cada 7) del tramo con salidas, del primer al último día con movimiento.",
    `Mínimo: lo que se consume en ${reposicion} día(s) laborable(s) de reposición, y nunca menos que la línea más grande del periodo, para poder servir cualquier pedido habitual desde el hueco.`,
    `Máximo: el mínimo más el consumo de ${cobertura} día(s) laborable(s) de cobertura.`,
    "Unidad: la caja de proveedor por defecto del artículo (la menor si hay varias) o 1; mínimo y máximo van en múltiplos de ella.",
];
