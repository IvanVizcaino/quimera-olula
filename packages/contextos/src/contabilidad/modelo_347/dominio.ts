export const CLAVES_TOTALES_MODELO_347 = [
    "totalentidades",
    "importetotal",
    "totalinmuebles",
    "totalarrendamiento",
] as const;

export type ClaveTotalModelo347 = (typeof CLAVES_TOTALES_MODELO_347)[number];

export const ETIQUETA_TOTAL_MODELO_347: Record<ClaveTotalModelo347, string> = {
    totalentidades: "Total entidades",
    importetotal: "Importe total",
    totalinmuebles: "Total inmuebles",
    totalarrendamiento: "Total arrendamiento",
};

export const parseModelo347Id = (texto: string): number | null => {
    const t = texto.trim();
    if (!/^\d+$/.test(t)) return null;
    const n = Number(t);
    return Number.isSafeInteger(n) && n > 0 ? n : null;
};

export const idDeclarado347 = (d: { nifdeclarado: string; clavecodigo: string }): string =>
    `${d.nifdeclarado}|${d.clavecodigo}`;

/** Mismo criterio que backend `nombre_fichero_sugerido` (plugins/modelo_347/shared/exportaeat). */
export const nombreFicheroExportAeatModelo347 = (anio: string, modeloId?: number): string => {
    const a = anio.trim();
    if (a) return `Resumen347_${a}.347`;
    if (modeloId != null) return `Resumen347_${modeloId}.347`;
    return "Resumen347.347";
};

export const nombreFicheroListado347 = (
    clave: "clientes" | "proveedores",
    modeloId: number
): string => `modelo-347-${clave}-${modeloId}.pdf`;

/** Obligatorios del BE `OBLIGATORIOS_INMUEBLE`. */
export const CAMPOS_OBLIGATORIOS_INMUEBLE_347 = [
    "nifarrendatario",
    "apellidosnombrers",
    "importe",
    "situacion",
    "refcatastral",
    "nombrevia",
    "localidad",
    "municipio",
    "codprovincia",
] as const;

export const camposInmueble347Vacios = (): Record<
    (typeof CAMPOS_OBLIGATORIOS_INMUEBLE_347)[number],
    string
> => ({
    nifarrendatario: "",
    apellidosnombrers: "",
    importe: "",
    situacion: "1",
    refcatastral: "",
    nombrevia: "",
    localidad: "",
    municipio: "",
    codprovincia: "",
});

export const validarCamposInmueble347 = (
    campos: Record<string, string>
): string | null => {
    for (const c of CAMPOS_OBLIGATORIOS_INMUEBLE_347) {
        if (!String(campos[c] ?? "").trim()) {
            return `Falta el campo obligatorio: ${c}`;
        }
    }
    const importe = Number(String(campos.importe).replace(",", "."));
    if (!Number.isFinite(importe)) return "Importe no válido";
    return null;
};
