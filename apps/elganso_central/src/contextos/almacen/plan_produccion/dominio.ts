import { MetaModelo } from "@olula/lib/dominio.ts";
import { fechaActual } from "@olula/lib/fecha.ts";
import {
    ArticuloTallas, CabeceraPlanProduccion, CambiosPlanProduccion, DestinoLineas, LineaPlanProduccion, TallaLinea,
} from "./diseño.ts";

/* ------------------------------------------------------------------ */
/* Cabecera                                                            */
/* ------------------------------------------------------------------ */

export const hoy = (): string => fechaActual().slice(0, 10);

export const cabeceraPlanVacia: CabeceraPlanProduccion = {
    id: "",
    descripcion: "",
    fecha: "",
    fechaSolicitada: null,
    fechaProveedor: null,
    estado: "Abierto",
    cantidad: 0,
    observaciones: "",
    proveedorId: null,
    nombreProveedor: null,
    almacenId: null,
    nombreAlmacen: null,
    fechaEntrega: null,
};

/**
 * No se usa `tipo: "fecha"`: las fechas del dominio son strings 'YYYY-MM-DD'
 * y ese tipo las convertiría a Date.
 */
export const metaCabeceraPlan: MetaModelo<CabeceraPlanProduccion> = {
    campos: {
        descripcion: { requerido: true },
        fecha: { requerido: true },
        estado: { requerido: true },
    },
};

export const destinoDeCabecera = (c: CabeceraPlanProduccion): DestinoLineas => ({
    proveedorId: c.proveedorId,
    nombreProveedor: c.nombreProveedor,
    almacenId: c.almacenId,
    nombreAlmacen: c.nombreAlmacen,
    fechaEntrega: c.fechaEntrega,
});

/** Cambios de cabecera a enviar al servidor (solo los campos que difieren). */
export const cambiosCabecera = (
    original: CabeceraPlanProduccion,
    nueva: CabeceraPlanProduccion
): CambiosPlanProduccion => {
    const campos = [
        "descripcion", "fecha", "fechaSolicitada", "fechaProveedor", "estado",
        "observaciones", "proveedorId", "almacenId", "fechaEntrega",
    ] as const;
    const cambios: Record<string, unknown> = {};
    for (const campo of campos) {
        if ((original[campo] ?? null) !== (nueva[campo] ?? null)) {
            cambios[campo] = nueva[campo];
        }
    }
    return cambios as CambiosPlanProduccion;
};

/* ------------------------------------------------------------------ */
/* Rejilla: columnas, totales y edición                                */
/* ------------------------------------------------------------------ */

export interface ColumnaTalla {
    talla: string;
    descripcion: string;
    grupo: string;
    orden: number | null;
}

/**
 * Columnas de talla = unión de las tallas de todas las líneas. Los grupos se
 * ordenan por primera aparición; dentro de cada grupo por `orden` (nulls al
 * final) y luego por código.
 */
export const columnasTalla = (lineas: LineaPlanProduccion[]): ColumnaTalla[] => {
    const grupos: string[] = [];
    const porTalla = new Map<string, ColumnaTalla>();

    for (const linea of lineas) {
        for (const t of linea.tallas) {
            if (!grupos.includes(t.grupo)) grupos.push(t.grupo);
            if (!porTalla.has(t.talla)) {
                porTalla.set(t.talla, {
                    talla: t.talla, descripcion: t.descripcion, grupo: t.grupo, orden: t.orden,
                });
            }
        }
    }

    return [...porTalla.values()].sort((a, b) => {
        const g = grupos.indexOf(a.grupo) - grupos.indexOf(b.grupo);
        if (g !== 0) return g;
        if (a.orden !== b.orden) {
            if (a.orden === null) return 1;
            if (b.orden === null) return -1;
            return a.orden - b.orden;
        }
        return a.talla.localeCompare(b.talla, "es", { numeric: true });
    });
};

/** Cantidad de una talla en una línea; undefined si la referencia no tiene esa talla. */
export const cantidadTalla = (linea: LineaPlanProduccion, talla: string): number | undefined =>
    linea.tallas.find((t) => t.talla === talla)?.cantidad;

export const totalLinea = (linea: LineaPlanProduccion): number =>
    linea.tallas.reduce((suma, t) => suma + t.cantidad, 0);

export const totalColumna = (lineas: LineaPlanProduccion[], talla: string): number =>
    lineas.reduce((suma, l) => suma + (cantidadTalla(l, talla) ?? 0), 0);

export const totalGeneral = (lineas: LineaPlanProduccion[]): number =>
    lineas.reduce((suma, l) => suma + totalLinea(l), 0);

export const cambiarCantidad = (
    lineas: LineaPlanProduccion[],
    indice: number,
    talla: string,
    cantidad: number
): LineaPlanProduccion[] =>
    lineas.map((l, i) =>
        i !== indice
            ? l
            : { ...l, tallas: l.tallas.map((t) => (t.talla === talla ? { ...t, cantidad } : t)) }
    );

export const quitarLinea = (lineas: LineaPlanProduccion[], indice: number): LineaPlanProduccion[] =>
    lineas.filter((_, i) => i !== indice);

export const normalizar = (texto: string): string =>
    texto.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();

const mismaReferencia = (a: string, b: string) => normalizar(a) === normalizar(b);

export const lineaDesdeArticulo = (
    articulo: ArticuloTallas,
    destino: DestinoLineas,
    descripcion?: string,
    cantidades: Record<string, number> = {}
): LineaPlanProduccion => ({
    referencia: articulo.referencia,
    descripcion: descripcion || articulo.descripcion,
    ...destino,
    tallas: articulo.tallas.map((t): TallaLinea => ({ ...t, cantidad: cantidades[t.talla] ?? 0 })),
});

/** Añade una línea nueva; lanza error si la referencia ya está en la rejilla. */
export const anadirLinea = (
    lineas: LineaPlanProduccion[],
    articulo: ArticuloTallas,
    destino: DestinoLineas
): LineaPlanProduccion[] => {
    if (lineas.some((l) => mismaReferencia(l.referencia, articulo.referencia))) {
        throw new Error(`La referencia ${articulo.referencia} ya está en la rejilla`);
    }
    return [...lineas, lineaDesdeArticulo(articulo, destino)];
};

/** Aplica a todas las líneas los valores de destino que no sean nulos. */
export const aplicarDestino = (lineas: LineaPlanProduccion[], destino: DestinoLineas): LineaPlanProduccion[] =>
    lineas.map((l) => ({
        ...l,
        ...(destino.proveedorId ? { proveedorId: destino.proveedorId, nombreProveedor: destino.nombreProveedor } : {}),
        ...(destino.almacenId ? { almacenId: destino.almacenId, nombreAlmacen: destino.nombreAlmacen } : {}),
        ...(destino.fechaEntrega ? { fechaEntrega: destino.fechaEntrega } : {}),
    }));

const claveRejilla = (lineas: LineaPlanProduccion[]): string =>
    JSON.stringify(
        lineas.map((l) => [
            l.id ?? null,
            l.referencia,
            l.descripcion,
            l.proveedorId ?? null,
            l.almacenId ?? null,
            l.fechaEntrega ?? null,
            l.tallas.filter((t) => t.cantidad > 0).map((t) => [t.talla, t.cantidad]),
        ])
    );

export const rejillaModificada = (
    original: LineaPlanProduccion[],
    actual: LineaPlanProduccion[]
): boolean => claveRejilla(original) !== claveRejilla(actual);

/* ------------------------------------------------------------------ */
/* Pegado desde Excel                                                  */
/* ------------------------------------------------------------------ */

export interface FilaPegada {
    /** Número de línea en el texto pegado (1 = cabecera). */
    fila: number;
    referencia: string;
    descripcion: string;
    /** Cantidad por etiqueta de talla de la Excel (solo celdas con valor). */
    cantidades: Record<string, number>;
    errores: string[];
}

export interface ResultadoParseo {
    error?: string;
    etiquetasTalla: string[];
    filas: FilaPegada[];
}

export const ERROR_SIN_CABECERA = "Copia también la fila de cabecera";

/**
 * Interpreta una celda de cantidad: vacía = sin cantidad (null); acepta enteros
 * y separador de miles ("1.000", "1,000"). Negativos, decimales o texto = error.
 */
export const parsearCantidad = (texto: string): { valor: number | null; error?: string } => {
    const t = texto.trim();
    if (t === "") return { valor: null };
    if (/^\d+$/.test(t)) return { valor: parseInt(t, 10) };
    if (/^\d{1,3}([.,]\d{3})+$/.test(t)) return { valor: parseInt(t.replace(/[.,]/g, ""), 10) };
    if (/^-\d/.test(t)) return { valor: null, error: `"${t}" es una cantidad negativa` };
    if (/^\d+[.,]\d+$/.test(t)) return { valor: null, error: `"${t}" no es un número entero` };
    return { valor: null, error: `"${t}" no es una cantidad válida` };
};

/** Parsea el TSV que Excel deja en el portapapeles (con la fila de cabecera). */
export const parsearPegado = (texto: string): ResultadoParseo => {
    const lineas = texto.split(/\r\n|\n|\r/);
    const indiceCabecera = lineas.findIndex((l) => l.trim() !== "");
    const sinCabecera: ResultadoParseo = { error: ERROR_SIN_CABECERA, etiquetasTalla: [], filas: [] };
    if (indiceCabecera < 0) return sinCabecera;

    const cabecera = lineas[indiceCabecera].split("\t");
    let colReferencia = -1;
    let colDescripcion = -1;
    const colsTalla: { etiqueta: string; indice: number }[] = [];

    cabecera.forEach((celda, indice) => {
        const etiqueta = celda.trim();
        const h = normalizar(etiqueta);
        if (h === "") return;
        if (colReferencia < 0 && h.startsWith("referencia")) colReferencia = indice;
        else if (colDescripcion < 0 && h.includes("descrip")) colDescripcion = indice;
        else if (h.includes("total")) return;
        else if (!colsTalla.some((c) => c.etiqueta === etiqueta)) colsTalla.push({ etiqueta, indice });
    });

    if (colReferencia < 0) return sinCabecera;

    const filas: FilaPegada[] = [];
    lineas.slice(indiceCabecera + 1).forEach((linea, i) => {
        if (linea.trim() === "") return;
        const celdas = linea.split("\t");
        const referencia = (celdas[colReferencia] ?? "").trim();
        if (referencia === "" || normalizar(referencia).startsWith("total")) return;

        const cantidades: Record<string, number> = {};
        const errores: string[] = [];
        for (const { etiqueta, indice } of colsTalla) {
            const { valor, error } = parsearCantidad(celdas[indice] ?? "");
            if (error) errores.push(`Talla ${etiqueta}: ${error}`);
            else if (valor !== null) cantidades[etiqueta] = valor;
        }

        filas.push({
            fila: indiceCabecera + 2 + i,
            referencia,
            descripcion: colDescripcion >= 0 ? (celdas[colDescripcion] ?? "").trim() : "",
            cantidades,
            errores,
        });
    });

    return { etiquetasTalla: colsTalla.map((c) => c.etiqueta), filas };
};

export interface FilaResuelta {
    fila: number;
    referencia: string;
    descripcion: string;
    /** Cantidad por código de talla del artículo (vacío si hay error). */
    cantidades: Record<string, number>;
    /** Suma de las cantidades de la fila tal como venían en la Excel (también si hay error). */
    unidades: number;
    articulo?: ArticuloTallas;
    error?: string;
}

/**
 * Resuelve las etiquetas de talla de la Excel contra las tallas de cada
 * referencia (primero por código, después por descripción, sin distinguir
 * mayúsculas) y marca las filas con error.
 */
export const resolverPegado = (
    filas: FilaPegada[],
    articulos: ArticuloTallas[]
): FilaResuelta[] => {
    const porReferencia = new Map(articulos.map((a) => [normalizar(a.referencia), a]));
    const vistas = new Set<string>();

    return filas.map((f): FilaResuelta => {
        const clave = normalizar(f.referencia);
        const errores = [...f.errores];
        const articulo = porReferencia.get(clave);
        const cantidades: Record<string, number> = {};

        if (!articulo) {
            errores.push("La referencia no existe");
        } else {
            for (const [etiqueta, cantidad] of Object.entries(f.cantidades)) {
                const e = normalizar(etiqueta);
                const talla =
                    articulo.tallas.find((t) => normalizar(t.talla) === e) ??
                    articulo.tallas.find((t) => normalizar(t.descripcion) === e);
                if (talla) cantidades[talla.talla] = cantidad;
                else if (cantidad > 0) errores.push(`La referencia no tiene la talla ${etiqueta}`);
            }
        }
        if (vistas.has(clave)) errores.push("Referencia repetida en el pegado");
        vistas.add(clave);

        return {
            fila: f.fila,
            referencia: articulo?.referencia ?? f.referencia,
            descripcion: f.descripcion,
            cantidades: errores.length > 0 ? {} : cantidades,
            unidades: Object.values(f.cantidades).reduce((a, b) => a + b, 0),
            articulo,
            error: errores.length > 0 ? errores.join("; ") : undefined,
        };
    });
};

export const filasValidas = (filas: FilaResuelta[]) => filas.filter((f) => !f.error && f.articulo);

/**
 * Fusiona las filas válidas del pegado en la rejilla: las referencias que ya
 * están se sobrescriben (tallas ausentes a 0); las nuevas se añaden con el
 * destino de la cabecera. Las líneas no incluidas en el pegado se mantienen.
 */
export const fusionarPegado = (
    rejilla: LineaPlanProduccion[],
    filas: FilaResuelta[],
    destino: DestinoLineas
): LineaPlanProduccion[] => {
    let resultado = [...rejilla];
    for (const fila of filasValidas(filas)) {
        const articulo = fila.articulo!;
        const indice = resultado.findIndex((l) => mismaReferencia(l.referencia, articulo.referencia));
        if (indice >= 0) {
            const linea = resultado[indice];
            resultado = resultado.map((l, i) =>
                i !== indice
                    ? l
                    : {
                        ...linea,
                        tallas: articulo.tallas.map((t): TallaLinea => ({
                            ...t, cantidad: fila.cantidades[t.talla] ?? 0,
                        })),
                    }
            );
        } else {
            resultado.push(lineaDesdeArticulo(articulo, destino, fila.descripcion, fila.cantidades));
        }
    }
    return resultado;
};
