import { MetaModelo } from "@olula/lib/dominio.ts";
import { CambiosSubcuenta, NuevaSubcuenta } from "./diseño.ts";

export const EJERCICIO_DEFECTO_SUBCUENTA = String(new Date().getFullYear());

export const metaNuevaSubcuenta: MetaModelo<NuevaSubcuenta> = {
    campos: {
        codigo: { requerido: true },
        nombre: { requerido: true },
        codigoCuenta: { requerido: true },
        ejercicioId: { requerido: true },
        impuestoId: { requerido: false },
    },
};

export const nuevaSubcuentaVacia = (ejercicioId = EJERCICIO_DEFECTO_SUBCUENTA): NuevaSubcuenta => ({
    codigo: "",
    nombre: "",
    codigoCuenta: "",
    ejercicioId,
    impuestoId: "",
});

export const etiquetaSubcuenta = (s: { codigo: string; nombre: string }): string =>
    s.nombre ? `${s.codigo} — ${s.nombre}` : s.codigo;

export const metaEditarSubcuenta: MetaModelo<CambiosSubcuenta> = {
    campos: {
        nombre: { requerido: true },
        impuestoId: { requerido: false },
    },
};

/** Texto final del proceso (Eneboo: «Proceso finalizado. Subcuentas actualizadas: N»). */
export const mensajeRecalculoSaldos = (r: {
    revisadas: number;
    corregidas: unknown[];
}): string =>
    `Proceso finalizado. Subcuentas actualizadas: ${r.revisadas}` +
    ` (${r.corregidas.length} con saldo corregido).`;
