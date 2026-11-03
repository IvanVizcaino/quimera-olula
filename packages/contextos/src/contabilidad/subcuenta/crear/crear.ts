import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevaSubcuenta } from "../diseño.ts";

export const metaNuevaSubcuenta: MetaModelo<NuevaSubcuenta> = {
    campos: {
        codigo: { requerido: true },
        nombre: { requerido: true },
        codigoCuenta: { requerido: true },
        ejercicioId: { requerido: true },
        impuestoId: { requerido: false },
    },
};

export const nuevaSubcuentaInicial = (ejercicioId: string): NuevaSubcuenta => ({
    codigo: "",
    nombre: "",
    codigoCuenta: "",
    ejercicioId,
    impuestoId: "",
});
