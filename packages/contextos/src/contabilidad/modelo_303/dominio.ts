import type { ItemModelo303 } from "./diseño.ts";

/** Totales y casillas que el backend compara en el MVP (CLAVES_PRINCIPALES en calcular.py). */
export const CASILLAS_CLAVE_MODELO_303 = [
    "cuotadevtotal",
    "cuotadedtotal",
    "cuotadif",
    "resliquid",
    "cuotaresultado",
    "cuotarg1",
    "cuotarg2",
    "cuotarg3",
    "cuotare1",
    "cuotare2",
    "cuotare3",
    "cuotambc",
    "cuotambcre",
    "cuotadedoibc",
    "cuotarecded",
] as const;

export type CasillaClaveModelo303 = (typeof CASILLAS_CLAVE_MODELO_303)[number];

export const ETIQUETA_CASILLA_MODELO_303: Record<CasillaClaveModelo303, string> = {
    cuotadevtotal: "Cuota devengada total",
    cuotadedtotal: "Cuota deducible total",
    cuotadif: "Diferencia (devengada − deducible)",
    resliquid: "Resultado liquidación",
    cuotaresultado: "Cuota resultado",
    cuotarg1: "Cuota RG 1",
    cuotarg2: "Cuota RG 2",
    cuotarg3: "Cuota RG 3",
    cuotare1: "Cuota RE 1",
    cuotare2: "Cuota RE 2",
    cuotare3: "Cuota RE 3",
    cuotambc: "Cuota IVA deducible intracomunitario",
    cuotambcre: "Cuota RE deducible intracomunitario",
    cuotadedoibc: "Cuota deducible operaciones IBC",
    cuotarecded: "Cuota RE deducible",
};

export const etiquetaPeriodoModelo303 = (
    item: Pick<ItemModelo303, "tipoPeriodo" | "trimestre" | "mes">
): string => {
    if (item.trimestre) return item.trimestre;
    if (item.mes) return item.mes;
    if (item.tipoPeriodo) return item.tipoPeriodo;
    return "—";
};

export const parseModelo303Id = (texto: string): number | null => {
    const t = texto.trim();
    if (!/^\d+$/.test(t)) return null;
    const n = Number(t);
    return Number.isSafeInteger(n) && n > 0 ? n : null;
};

/** Mismo criterio que backend `nombre_fichero_sugerido` / `periodo_codigo`. */
export const nombreFicheroExportAeatModelo303 = (
    item: Pick<ItemModelo303, "codejercicio" | "fechaInicio" | "trimestre" | "mes" | "modeloId">
): string => {
    const ej =
        (item.fechaInicio.length >= 4 ? item.fechaInicio.slice(0, 4) : "") ||
        item.codejercicio.slice(0, 4);
    const per = item.trimestre
        ? item.trimestre
        : item.fechaInicio.length >= 7
          ? item.fechaInicio.slice(5, 7)
          : item.mes
            ? item.mes.slice(0, 2)
            : "";
    if (!ej || !per) return `Resumen303_${item.modeloId}.303`;
    return `Resumen303_${ej}_${per}.303`;
};
