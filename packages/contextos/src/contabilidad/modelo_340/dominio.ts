export const CLAVES_TOTALES_MODELO_340 = [
    "registros",
    "baseimponible",
    "cuotaimpuesto",
    "totalfacturas",
] as const;

export type ClaveTotalModelo340 = (typeof CLAVES_TOTALES_MODELO_340)[number];

export const ETIQUETA_TOTAL_MODELO_340: Record<ClaveTotalModelo340, string> = {
    registros: "Registros",
    baseimponible: "Base imponible",
    cuotaimpuesto: "Cuota IVA",
    totalfacturas: "Total facturas",
};

export const parseModelo340Id = (texto: string): number | null => {
    const t = texto.trim();
    if (!/^\d+$/.test(t)) return null;
    const n = Number(t);
    return Number.isSafeInteger(n) && n > 0 ? n : null;
};

export const idRegistro340 = (r: { tipolibro: string; idenfactura: string }): string =>
    `${r.tipolibro}|${r.idenfactura}`;

export const etiquetaTipoLibro340 = (tipolibro: string): string =>
    tipolibro === "E" ? "Emitidas" : tipolibro === "R" ? "Recibidas" : tipolibro;

/** Mismo criterio que backend `nombre_fichero_sugerido` (plugins/modelo_340/shared/exportaeat). */
export const nombreFicheroExportAeatModelo340 = (anio: string, modeloId?: number): string => {
    const a = anio.trim();
    if (a) return `Resumen340_${a}.340`;
    if (modeloId != null) return `Resumen340_${modeloId}.340`;
    return "Resumen340.340";
};
