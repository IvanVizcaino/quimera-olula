import { formatearMoneda } from "@olula/lib/dominio.ts";

/** Identificadores del catálogo (planes, límites, extras): minúsculas, números y "_". */
export const idCatalogoValido = (id: string): boolean => /^[a-z][a-z0-9_]{1,39}$/.test(id);

export const MENSAJE_ID_CATALOGO = "Minúsculas, números y _; empieza por letra (2-40 caracteres)";

/** La API usa importes como texto con punto decimal; el usuario puede teclear coma. */
export const normalizarImporte = (texto: string): string => texto.trim().replace(",", ".");

export const importeValido = (texto: string): boolean =>
    /^\d+(\.\d{1,2})?$/.test(normalizarImporte(texto));

/** Importe listo para enviar: dos decimales si es válido; si no, el texto tal cual (la API responderá 400). */
export const aImporte = (texto: string): string =>
    importeValido(texto) ? Number(normalizarImporte(texto)).toFixed(2) : texto.trim();

export const formatearImporte = (importe: string | number | null | undefined): string => {
    if (importe === null || importe === undefined || importe === "") return "";
    return formatearMoneda(importe, "EUR");
};

/** Texto de un número opcional: vacío si es null. */
export const numeroATexto = (n: number | null | undefined): string =>
    n === null || n === undefined ? "" : String(n);

/** Número entero a partir de un texto; null si está vacío o no es válido. */
export const textoANumero = (texto: string): number | null => {
    const t = texto.trim();
    if (t === "") return null;
    const n = Number(t.replace(",", "."));
    return Number.isFinite(n) ? n : null;
};
