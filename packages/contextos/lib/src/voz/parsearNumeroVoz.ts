const UNIDADES: Record<string, number> = {
    cero: 0, uno: 1, una: 1, un: 1, dos: 2, tres: 3, cuatro: 4,
    cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
    once: 11, doce: 12, trece: 13, catorce: 14, quince: 15,
    dieciséis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19,
    dieciseis: 16,
    veinte: 20, veintiuno: 21, veintiuna: 21, veintidós: 22, veintidos: 22,
    veintitrés: 23, veintitres: 23, veinticuatro: 24, veinticinco: 25,
    veintiséis: 26, veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29,
};

const DECENAS: Record<string, number> = {
    treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60,
    setenta: 70, ochenta: 80, noventa: 90,
};

const parsearGrupo = (texto: string): number | null => {
    const limpio = texto.trim().toLowerCase();
    if (!limpio) return null;

    // Número directo
    const directo = parseFloat(limpio.replace(",", "."));
    if (!isNaN(directo)) return directo;

    // Unidades simples (0-29)
    if (limpio in UNIDADES) return UNIDADES[limpio];

    // Decenas simples (30-90)
    if (limpio in DECENAS) return DECENAS[limpio];

    // Decenas compuestas: "treinta y cinco"
    const partes = limpio.split(/\s+y\s+/);
    if (partes.length === 2) {
        const decena = DECENAS[partes[0]];
        const unidad = UNIDADES[partes[1]];
        if (decena !== undefined && unidad !== undefined) {
            return decena + unidad;
        }
    }

    // "cien" / "ciento X"
    if (limpio === "cien") return 100;
    if (limpio.startsWith("ciento ")) {
        const resto = parsearGrupo(limpio.slice(7));
        if (resto !== null && resto < 100) return 100 + resto;
    }

    // Centenas: "doscientos", "trescientos"...
    const centenas: Record<string, number> = {
        doscientos: 200, doscientas: 200, trescientos: 300, trescientas: 300,
        cuatrocientos: 400, cuatrocientas: 400, quinientos: 500, quinientas: 500,
        seiscientos: 600, seiscientas: 600, setecientos: 700, setecientas: 700,
        ochocientos: 800, ochocientas: 800, novecientos: 900, novecientas: 900,
    };

    // Centena exacta
    if (limpio in centenas) return centenas[limpio];

    // Centena + resto: "doscientos treinta y cinco"
    for (const [palabra, valor] of Object.entries(centenas)) {
        if (limpio.startsWith(palabra + " ")) {
            const resto = parsearGrupo(limpio.slice(palabra.length + 1));
            if (resto !== null && resto < 100) return valor + resto;
        }
    }

    return null;
};

/**
 * Convierte texto hablado en español a número.
 *
 * Soporta:
 * - Dígitos directos: "12", "3,5"
 * - Palabras cardinales: "doce", "veintitrés", "ciento cincuenta"
 * - Decimales: "tres coma cinco", "doce punto cinco"
 * - Importes: "doce con cincuenta", "12 euros con 50", "veinte con cinco céntimos"
 * - Miles: "mil", "dos mil trescientos"
 * - Rango: 0–9999
 *
 * Devuelve null si no puede parsear.
 */
export const parsearNumeroVoz = (texto: string): number | null => {
    const limpio = texto.trim().toLowerCase();
    if (!limpio) return null;

    // Importes: "doce con cincuenta", "12 euros con 50", "doce euros cincuenta",
    // "veinte con cinco céntimos" — los céntimos son siempre dos cifras (con cinco = ,05).
    const importe = limpio.match(/^(.+?)\s+(?:(?:euros?|€)\s+(?:con\s+)?|con\s+)(.+?)(?:\s+c[eé]ntimos?)?$/);
    if (importe) {
        const euros = parsearNumeroVoz(importe[1]);
        const cents = parsearNumeroVoz(importe[2]);
        if (euros !== null && cents !== null && Number.isInteger(cents) && cents >= 0 && cents <= 99) {
            return euros + cents / 100;
        }
    }
    // "12 euros" a secas.
    const soloEuros = limpio.match(/^(.+?)\s+(?:euros?|€)$/);
    if (soloEuros) return parsearNumeroVoz(soloEuros[1]);

    // Decimal con separador "coma" o "punto"
    const separador = limpio.match(/^(.+?)\s+(coma|punto)\s+(.+)$/);
    if (separador) {
        const entera = parsearNumeroVoz(separador[1]);
        const decimal = parsearNumeroVoz(separador[3]);
        if (entera !== null && decimal !== null && decimal >= 0) {
            const decimalesStr = String(decimal);
            return entera + decimal / Math.pow(10, decimalesStr.length);
        }
    }

    // "mil" exacto
    if (limpio === "mil") return 1000;

    // "X mil Y": "dos mil trescientos"
    const milIdx = limpio.indexOf(" mil");
    if (milIdx !== -1) {
        const antesMil = limpio.slice(0, milIdx);
        const despuesMil = limpio.slice(milIdx + 4).trim();
        const miles = parsearGrupo(antesMil);
        if (miles !== null && miles >= 1 && miles <= 9) {
            const resto = despuesMil ? parsearGrupo(despuesMil) : 0;
            if (resto !== null) return miles * 1000 + resto;
        }
    }

    // "mil X": "mil doscientos"
    if (limpio.startsWith("mil ")) {
        const resto = parsearGrupo(limpio.slice(4));
        if (resto !== null) return 1000 + resto;
    }

    return parsearGrupo(limpio);
};
