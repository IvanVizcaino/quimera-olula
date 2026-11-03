const MESES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const fecha = (original: string, dia: number, mes: number, anyo: number): string =>
    mes >= 1 && mes <= 12 && dia >= 1 && dia <= 31 ? `${dia} de ${MESES[mes - 1]} de ${anyo}` : original;

const hora = (h: string, m: string): string => (m === "00" ? `${Number(h)}` : `${Number(h)} y ${Number(m)}`);

const sinMiles = (numero: string): string => numero.replace(/\./g, "");

const UNIDADES: Record<string, string> = {
    ud: "unidades", uds: "unidades", u: "unidades",
    kg: "kilos", g: "gramos", km: "kilómetros", cm: "centímetros", mm: "milímetros",
    l: "litros", ml: "mililitros",
};

/**
 * Texto preparado para el sintetizador de voz: el TTS del navegador lee mal los
 * formatos habituales de un ERP ("1.500,00 €", "2026-10-05", "PED-00123", "15 uds").
 * Red de seguridad: el asistente ya intenta responder en lenguaje natural en modo voz.
 */
export const normalizarParaVoz = (texto: string): string =>
    texto
        // Fechas ISO, con hora opcional: 2026-10-05, 2026-10-05T14:30:00
        .replace(/\b(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?Z?)?\b/g,
            (original, a, m, d, h, mi) => {
                const leida = fecha(original, Number(d), Number(m), Number(a));
                return h && leida !== original ? `${leida}, a las ${hora(h, mi)}` : leida;
            })
        // Fechas dd/mm/aaaa
        .replace(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g,
            (original, d, m, a) => fecha(original, Number(d), Number(m), Number(a)))
        // Importes: 1.500,00 € · 12,5 € · 3 EUR · 1.200 euros
        .replace(/(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?\s?(?:€|EUR\b|euros?\b)/g,
            (_, entero: string, decimales: string | undefined) => {
                const euros = sinMiles(entero);
                const centimos = decimales ? Number(decimales.padEnd(2, "0")) : 0;
                const base = `${euros} ${euros === "1" ? "euro" : "euros"}`;
                return centimos ? `${base} con ${centimos}` : base;
            })
        // Porcentajes
        .replace(/(\d+(?:,\d+)?)\s?%/g, "$1 por ciento")
        // Separador de miles sin moneda: 12.000 → 12000 (el punto haría una pausa)
        .replace(/\b\d{1,3}(?:\.\d{3})+(?![\d,])/g, sinMiles)
        // Horas sueltas: 14:30
        .replace(/\b([01]?\d|2[0-3]):([0-5]\d)\b/g, (_, h, m) => hora(h, m))
        // Códigos de documento: PED-00123 → PED 123
        .replace(/\b([A-Z]{2,5})[-/_]0*(\d+)\b/g, "$1 $2")
        // Unidades tras un número: 15 uds, 2,5 kg
        .replace(/(\d)\s?(uds?|u|kg|g|km|cm|mm|l|ml)\.?(?![\p{L}\d])/gu,
            (_, digito: string, unidad: string) => `${digito} ${UNIDADES[unidad.toLowerCase()]}`);
