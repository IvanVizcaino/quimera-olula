import { ClausulaFiltro, Criteria, Filtro } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { ejercicioActual } from "#/contabilidad/asiento/dominio.ts";
import { OpcionesLibroRecc, TipoInformeContableReport } from "./diseño.ts";

export { ejercicioActual };

/** Formato PGC 2008 del formulario de cuentas anuales (`formato` en el `q`). */
export type FormatoCuentasAnuales = "Normal" | "Abreviado";

/** Desglose PGC 2008 (`nivel_desglose` en el `q`). */
export type NivelDesgloseCuentasAnuales = "No desglosar" | "Cuenta" | "Subcuenta";

export interface FiltrosInformePeriodo {
    ejercicioId: string;
    fechaDesde?: string;
    fechaHasta?: string;
    /** Comparativo PGC 2008 / ECPN (`ejercicio_anterior_id`). */
    ejercicioAnteriorId?: string;
    /** Balance / PyG / IG: Normal | Abreviado. */
    formato?: FormatoCuentasAnuales;
    /** Balance / PyG / IG: No desglosar | Cuenta | Subcuenta. */
    nivelDesglose?: NivelDesgloseCuentasAnuales;
    /** Omitir líneas sin saldo (PGC 2008). */
    omitirSinSaldo?: boolean;
}

const clausulasPeriodo = ({
    ejercicioId,
    fechaDesde,
    fechaHasta,
    ejercicioAnteriorId,
    formato,
    nivelDesglose,
    omitirSinSaldo,
}: FiltrosInformePeriodo): ClausulaFiltro[] => {
    const clausulas: ClausulaFiltro[] = [["ejercicio_id", "eq", ejercicioId]];
    if (ejercicioAnteriorId?.trim()) {
        clausulas.push(["ejercicio_anterior_id", "eq", ejercicioAnteriorId.trim()]);
    }
    if (fechaDesde?.trim()) {
        clausulas.push(["fecha", ">=", fechaDesde.trim()]);
    }
    if (fechaHasta?.trim()) {
        clausulas.push(["fecha", "<=", fechaHasta.trim()]);
    }
    if (formato) {
        clausulas.push(["formato", "eq", formato]);
    }
    if (nivelDesglose) {
        clausulas.push(["nivel_desglose", "eq", nivelDesglose]);
    }
    if (omitirSinSaldo) {
        clausulas.push(["omitir_sin_saldo", "eq", "true"]);
    }
    return clausulas;
};

export const OPCIONES_FORMATO_CUENTAS_ANUALES: { valor: FormatoCuentasAnuales; descripcion: string }[] = [
    { valor: "Normal", descripcion: "Normal" },
    { valor: "Abreviado", descripcion: "Abreviado" },
];

export const OPCIONES_NIVEL_DESGLOSE_CUENTAS_ANUALES: {
    valor: NivelDesgloseCuentasAnuales;
    descripcion: string;
}[] = [
    { valor: "No desglosar", descripcion: "No desglosar" },
    { valor: "Cuenta", descripcion: "Por cuenta" },
    { valor: "Subcuenta", descripcion: "Por subcuenta" },
];

export const criteriaInformePeriodo = (filtros: FiltrosInformePeriodo): Criteria => ({
    ...criteriaDefecto,
    filtro: clausulasPeriodo(filtros) as Filtro,
});

export const criteriaInformeMayor = (
    filtros: FiltrosInformePeriodo & { subcuentaId: string }
): Criteria => ({
    ...criteriaDefecto,
    filtro: [...clausulasPeriodo(filtros), ["subcuenta_id", "eq", filtros.subcuentaId]] as Filtro,
});

const NOMBRES_PDF_INFORME: Record<TipoInformeContableReport, string> = {
    mayor: "mayor.pdf",
    sumas_saldos: "sumas-saldos.pdf",
    balance: "balance.pdf",
    pyg: "pyg.pdf",
    diario: "diario.pdf",
    ingresos_gastos: "ingresos-gastos.pdf",
    patrimonio: "patrimonio.pdf",
    libro_facturas_emitidas: "libro-facturas-emitidas.pdf",
    libro_facturas_recibidas: "libro-facturas-recibidas.pdf",
    libro_facturas_recibidas_ccaja: "libro-facturas-recibidas-ccaja.pdf",
};

export const nombreFicheroPdfInforme = (tipo: TipoInformeContableReport): string =>
    NOMBRES_PDF_INFORME[tipo];

// --- Libro IVA recibidas con criterio de caja (Eneboo `co_i_facturasrec`) ---

export const opcionesLibroReccVacias = (): OpcionesLibroRecc => ({
    codigoSerie: "",
    conIva: false,
    codImpuesto: "",
    codGrupoIvaNeg: "",
    numeracionAuto: false,
    numDesde: 1,
    agruparIvaNeg: false,
});

/** Fechas por defecto del ejercicio (Eneboo las rellena con `fechainicio`/`fechafin`). */
export const fechasEjercicioPorDefecto = (
    ejercicioId: string
): { fechaDesde: string; fechaHasta: string } =>
    /^\d{4}$/.test(ejercicioId.trim())
        ? { fechaDesde: `${ejercicioId.trim()}-01-01`, fechaHasta: `${ejercicioId.trim()}-12-31` }
        : { fechaDesde: "", fechaHasta: "" };

/**
 * `q` del libro RECC: período + opciones del formulario. Solo se envían las opciones
 * informadas (el backend aplica los valores por defecto de Eneboo).
 */
export const criteriaLibroRecc = (
    filtros: FiltrosInformePeriodo,
    opciones: OpcionesLibroRecc
): Criteria => {
    const clausulas: ClausulaFiltro[] = [...clausulasPeriodo(filtros)];
    if (opciones.codigoSerie.trim()) clausulas.push(["codigo_serie", "eq", opciones.codigoSerie.trim()]);
    if (opciones.conIva) clausulas.push(["con_iva", "eq", "true"]);
    if (opciones.codImpuesto.trim()) clausulas.push(["cod_impuesto", "eq", opciones.codImpuesto.trim()]);
    if (opciones.codGrupoIvaNeg.trim()) {
        clausulas.push(["cod_grupo_iva_neg", "eq", opciones.codGrupoIvaNeg.trim()]);
    }
    if (opciones.numeracionAuto) {
        clausulas.push(["numeracion_auto", "eq", "true"]);
        clausulas.push(["num_desde", "eq", String(opciones.numDesde)]);
    }
    if (opciones.agruparIvaNeg) clausulas.push(["agrupar_iva_neg", "eq", "true"]);
    return { ...criteriaDefecto, filtro: clausulas as Filtro };
};

/** Validaciones del formulario Eneboo (`co_i_facturasrec.validateForm`) + fechas obligatorias en la API. */
export const validarFiltrosLibroRecc = (filtros: FiltrosInformePeriodo): string | null => {
    if (!filtros.ejercicioId.trim()) return "Indique el ejercicio.";
    if (!filtros.fechaDesde?.trim() || !filtros.fechaHasta?.trim()) {
        return "Indique las fechas desde y hasta.";
    }
    if (filtros.fechaDesde.trim() > filtros.fechaHasta.trim()) {
        return "La fecha de inicio debe ser menor que la de fin";
    }
    return null;
};
