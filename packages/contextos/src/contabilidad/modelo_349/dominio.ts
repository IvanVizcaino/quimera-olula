export const CLAVES_TOTALES_MODELO_349 = [
    "numtotaloi",
    "importetotaloi",
    "numtotaloirec",
    "importetotaloirec",
] as const;

export type ClaveTotalModelo349 = (typeof CLAVES_TOTALES_MODELO_349)[number];

export const ETIQUETA_TOTAL_MODELO_349: Record<ClaveTotalModelo349, string> = {
    numtotaloi: "N.º operaciones intracom (01)",
    importetotaloi: "Importe operaciones intracom (02)",
    numtotaloirec: "N.º rectificaciones (03)",
    importetotaloirec: "Importe rectificaciones (04)",
};

export const parseModelo349Id = (texto: string): number | null => {
    const t = texto.trim();
    if (!/^\d+$/.test(t)) return null;
    const n = Number(t);
    return Number.isSafeInteger(n) && n > 0 ? n : null;
};

export const idOperacion349 = (o: {
    clave: string;
    codcliente: string | null;
    codproveedor: string | null;
    cifnif: string;
}): string => `${o.clave}|${o.codcliente ?? ""}|${o.codproveedor ?? ""}|${o.cifnif}`;

/** Mismo criterio que backend `nombre_fichero_sugerido` (plugins/modelo_349/shared/exportaeat). */
export const nombreFicheroExportAeatModelo349 = (anio: string, modeloId?: number): string => {
    const a = anio.trim();
    if (a) return `Resumen349_${a}.349`;
    if (modeloId != null) return `Resumen349_${modeloId}.349`;
    return "Resumen349.349";
};
