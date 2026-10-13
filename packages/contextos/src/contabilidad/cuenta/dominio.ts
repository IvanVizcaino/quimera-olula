import { MetaModelo } from "@olula/lib/dominio.ts";
import { CambiosCuenta, NuevaCuenta } from "./diseño.ts";

export const EJERCICIO_DEFECTO_CUENTA = String(new Date().getFullYear());

export const metaNuevaCuenta: MetaModelo<NuevaCuenta> = {
    campos: {
        codigo: { requerido: true },
        nombre: { requerido: true },
        codigoEpigrafe: { requerido: true },
        ejercicioId: { requerido: true },
    },
};

export const nuevaCuentaVacia = (ejercicioId = EJERCICIO_DEFECTO_CUENTA): NuevaCuenta => ({
    codigo: "",
    nombre: "",
    codigoEpigrafe: "",
    ejercicioId,
});

export const etiquetaCuenta = (c: { codigo: string; nombre: string }): string =>
    c.nombre ? `${c.codigo} — ${c.nombre}` : c.codigo;

export const metaEditarCuenta: MetaModelo<CambiosCuenta> = {
    campos: {
        nombre: { requerido: true },
    },
};
