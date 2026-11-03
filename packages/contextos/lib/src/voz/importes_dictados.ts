import { parsearNumeroVoz } from "./parsearNumeroVoz.ts";

/**
 * Importes con decimales dictados → forma escrita sin ambigüedad ("12,50").
 *
 * El reconocedor transcribe un mismo precio de muchas formas: "12 con 50", "doce
 * euros cincuenta", "12 € con 50", "doce coma cinco", "12.50" (punto decimal a la
 * inglesa, que en español se leería como separador de miles)… Se normalizan todas a
 * coma decimal antes de mandar la orden, para que el asistente (o un formulario) no
 * tenga que adivinar.
 */

const MAX_PALABRAS_ENTERO = 5;
const MAX_PALABRAS_DECIMAL = 3;

const PALABRAS_EURO = new Set(["euro", "euros", "€", "eur"]);
const PALABRAS_CENTIMO = new Set(["centimo", "centimos", "céntimo", "céntimos", "cent"]);

/** Palabras que anuncian un importe — "con" entre dos números solo es un precio si
 * va cerca de una de ellas (o de "euros"/"céntimos"): "pedido 12 con 3 líneas" no. */
const PALABRAS_PRECIO = new Set([
    "precio", "precios", "importe", "importes", "cuesta", "cuestan", "vale", "valen", "coste", "costo",
    "tarifa", "pvp", "total", "sale", "salen", "cobra", "cobrar", "pagar", "pago",
]);
const DISTANCIA_PALABRA_PRECIO = 4;

const limpiarToken = (token: string): string => token.toLowerCase().replace(/[.,;:!?¿¡]+$/, "");

/** Número que ocupa exactamente los tokens [desde, hasta), o null. */
const numeroEn = (tokens: string[], desde: number, hasta: number): number | null => {
    if (desde < 0 || hasta > tokens.length || desde >= hasta) return null;
    const palabras = tokens.slice(desde, hasta).map(limpiarToken);
    // Ni separadores ni unidades dentro del número: eso lo interpreta quien llama.
    if (palabras.some(p => p === "con" || PALABRAS_EURO.has(p) || PALABRAS_CENTIMO.has(p))) return null;
    const trozo = palabras.join(" ");
    // Cifras: solo si son TODO el trozo (parseFloat aceptaría "50 la" como 50).
    if (/\d/.test(trozo) && !/^\d+$/.test(trozo)) return null;
    const valor = parsearNumeroVoz(trozo);
    return valor !== null && Number.isInteger(valor) && valor >= 0 ? valor : null;
};

/** El número más largo que termina justo antes de `fin` (tokens [inicio, fin)). */
const enteroHastaAqui = (tokens: string[], fin: number): { valor: number; inicio: number } | null => {
    for (let n = Math.min(MAX_PALABRAS_ENTERO, fin); n >= 1; n--) {
        const valor = numeroEn(tokens, fin - n, fin);
        if (valor !== null) return { valor, inicio: fin - n };
    }
    return null;
};

/** El número más largo que empieza en `inicio` (tokens [inicio, fin)). */
const decimalDesdeAqui = (
    tokens: string[], inicio: number, maximo: number,
): { valor: number; texto: string; fin: number } | null => {
    for (let n = Math.min(MAX_PALABRAS_DECIMAL, tokens.length - inicio); n >= 1; n--) {
        const valor = numeroEn(tokens, inicio, inicio + n);
        if (valor !== null && valor <= maximo) {
            return { valor, texto: tokens.slice(inicio, inicio + n).map(limpiarToken).join(" "), fin: inicio + n };
        }
    }
    return null;
};

const formatear = (entero: number, decimales: string): string => `${entero},${decimales}`;

/** Céntimos (0-99) como dos cifras: "doce con cinco" = 12,05; "con cincuenta" = 12,50. */
const centimos = (valor: number): string => String(valor).padStart(2, "0");

/** Puntuación final del token, para conservarla al reescribir ("12 con 50." → "12,50."). */
const puntuacionFinal = (token: string): string => /[.,;:!?]+$/.exec(token)?.[0] ?? "";

export const normalizarImportesDictados = (texto: string): string => {
    // "12.50" / "12.5" con punto decimal (no de miles: esos llevan 3 cifras detrás).
    let resultado = texto.replace(/\b(\d+)\.(\d{1,2})\b(?!\.\d)/g, "$1,$2");

    const tokens = resultado.split(/\s+/).filter(Boolean);
    const salida: string[] = [];
    let i = 0;
    while (i < tokens.length) {
        let reescrito: { texto: string; consumidos: number; inicio: number } | null = null;

        // Buscar un separador a partir de i: "con", "coma", "punto", o "euros" seguido de cifra.
        for (let j = i + 1; j < tokens.length && !reescrito; j++) {
            const separador = limpiarToken(tokens[j]);
            const entero = ["con", "coma", "punto"].includes(separador) || PALABRAS_EURO.has(separador)
                ? enteroHastaAqui(tokens, j)
                : null;
            if (!entero || entero.inicio < i) continue;

            let k = j + 1;
            let conEuros = false;
            if (PALABRAS_EURO.has(separador)) {
                conEuros = true;
                // "doce euros con cincuenta" / "doce euros cincuenta"
                if (limpiarToken(tokens[k] ?? "") === "con") k++;
            } else if (separador === "con" && PALABRAS_EURO.has(limpiarToken(tokens[j - 1] ?? ""))) {
                conEuros = true;
            }

            if (separador === "coma" || separador === "punto") {
                const decimal = decimalDesdeAqui(tokens, k, 999);
                if (!decimal) continue;
                // "coma cinco" = ,5 tal cual se dice; con cifras ya vienen en orden.
                const digitos = /^\d+$/.test(decimal.texto) ? decimal.texto : String(decimal.valor);
                reescrito = {
                    texto: formatear(entero.valor, digitos) + puntuacionFinal(tokens[decimal.fin - 1]),
                    consumidos: decimal.fin, inicio: entero.inicio,
                };
                break;
            }

            const decimal = decimalDesdeAqui(tokens, k, 99);
            if (!decimal) continue;
            let fin = decimal.fin;
            const siguiente = limpiarToken(tokens[fin] ?? "");
            const hayPrecioCerca = tokens
                .slice(Math.max(0, entero.inicio - DISTANCIA_PALABRA_PRECIO), entero.inicio)
                .some(t => PALABRAS_PRECIO.has(limpiarToken(t)));
            if (!conEuros && !PALABRAS_CENTIMO.has(siguiente) && !PALABRAS_EURO.has(siguiente) && !hayPrecioCerca) continue;
            if (PALABRAS_CENTIMO.has(limpiarToken(tokens[fin] ?? ""))) fin++;
            else if (PALABRAS_EURO.has(limpiarToken(tokens[fin] ?? ""))) {
                // "doce con cincuenta euros"
                conEuros = true;
                fin++;
            }
            // "con" solo entre dos números ya es un importe: "12 con 50".
            reescrito = {
                texto: formatear(entero.valor, centimos(decimal.valor)) + (conEuros ? " €" : "")
                    + puntuacionFinal(tokens[fin - 1]),
                consumidos: fin, inicio: entero.inicio,
            };
        }

        if (reescrito) {
            salida.push(...tokens.slice(i, reescrito.inicio), reescrito.texto);
            i = reescrito.consumidos;
        } else {
            salida.push(...tokens.slice(i));
            break;
        }
    }
    resultado = salida.join(" ");
    return resultado.replace(/ € €/g, " €");
};
