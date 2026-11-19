import { ClausulaFiltro, Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto, MetaModelo } from "@olula/lib/dominio.ts";
import {
    AlcanceRegeneracion,
    CodigoBalance,
    CuentaCodigoBalance,
    FormatoBalance,
    NuevaCuentaCodigoBalance,
} from "./diseño.ts";

export const NATURALEZAS = [
    { valor: "A", descripcion: "Activo" },
    { valor: "P", descripcion: "Patrimonio neto y pasivo" },
    { valor: "PG", descripcion: "Pérdidas y ganancias" },
    { valor: "IG", descripcion: "Ingresos y gastos" },
];

export const SIGNOS = [
    { valor: "Ambos", descripcion: "Ambos" },
    { valor: "Positivo", descripcion: "Positivo (saldo deudor)" },
    { valor: "Negativo", descripcion: "Negativo (saldo acreedor)" },
];

/** Longitud de `codcuenta` en `co_cuentascb` / `co_cuentascbba`. */
export const LONGITUD_MAXIMA_CUENTA = 6;

export const codigoBalanceVacio = (): CodigoBalance => ({
    id: "",
    naturaleza: "A",
    nivel1: "",
    descripcion1: "",
    nivel2: "",
    descripcion2: "",
    nivel3: "",
    orden3: "",
    descripcion3: "",
    nivel4: "",
    descripcion4: "",
    descripcion4ba: "",
});

/** La descripción más concreta que tenga el código (nivel 4, 3, 2 o 1). */
export const descripcionCodigoBalance = (c: CodigoBalance): string =>
    c.descripcion4 || c.descripcion3 || c.descripcion2 || c.descripcion1 || "";

export const etiquetaCodigoBalance = (c: CodigoBalance): string => {
    const descripcion = descripcionCodigoBalance(c);
    return descripcion ? `${c.id} — ${descripcion}` : c.id;
};

export const nivel2Valido = (nivel2: string): boolean =>
    nivel2.trim() === "" || /^\d+$/.test(nivel2.trim());

export const metaCodigoBalance: MetaModelo<CodigoBalance> = {
    campos: {
        naturaleza: { requerido: true },
        nivel2: {
            requerido: false,
            validacion: (c) => nivel2Valido(c.nivel2) || "Debe ser un número",
        },
    },
};

export const cuentaCodigoBalanceVacia = (): NuevaCuentaCodigoBalance => ({
    codigoCuenta: "",
    descripcionCuenta: "",
    signo: "Ambos",
});

export const metaCuentaCodigoBalance: MetaModelo<NuevaCuentaCodigoBalance> = {
    campos: {
        codigoCuenta: { requerido: true, maximo: LONGITUD_MAXIMA_CUENTA },
        descripcionCuenta: { requerido: false },
        signo: { requerido: true },
    },
};

export const etiquetaCuentaCodigoBalance = (c: CuentaCodigoBalance): string =>
    c.descripcionCuenta ? `${c.codigoCuenta} — ${c.descripcionCuenta}` : c.codigoCuenta;

export const filtroCuentasDeCodigo = (codigoBalanceId: string): ClausulaFiltro =>
    ["codigo_balance_id", "=", codigoBalanceId];

/** Todas las cuentas del código, ordenadas por cuenta (cabe en una página). */
export const criteriaCuentasDeCodigo = (codigoBalanceId: string): Criteria => ({
    ...criteriaDefecto,
    filtro: [filtroCuentasDeCodigo(codigoBalanceId)],
    orden: ["codigo_cuenta", "ASC"],
    paginacion: { limite: 1000, pagina: 1 },
});

export const ETIQUETA_FORMATO: Record<FormatoBalance, string> = {
    normal: "Cuentas normales",
    abreviado: "Cuentas de balance abreviado",
};

/** Avisos de los botones de regeneración de Eneboo (co_mastercodbalances08). */
export const AVISO_REGENERACION: Record<AlcanceRegeneracion, { titulo: string; mensaje: string }> = {
    todo: {
        titulo: "Regenerar códigos de balance",
        mensaje:
            "A continuación se regenerarán los códigos de balance 2008 y las " +
            "cuentas por código de balance (normal y abreviado). Se perderán " +
            "los cambios hechos a mano. ¿Desea continuar?",
    },
    cuentas: {
        titulo: "Regenerar cuentas por código de balance",
        mensaje:
            "A continuación se regenerarán las correspondencias entre cuentas y " +
            "códigos de balance. Las cuentas informadas manualmente deberán " +
            "volver a introducirse. ¿Desea continuar?",
    },
    cuentas_abreviado: {
        titulo: "Regenerar cuentas por código de balance abreviado",
        mensaje:
            "A continuación se regenerarán las correspondencias entre cuentas y " +
            "códigos de balance abreviado. Las cuentas informadas manualmente " +
            "deberán volver a introducirse. ¿Desea continuar?",
    },
};
