import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevaCuenta } from "../diseño.ts";

export const metaNuevaCuenta: MetaModelo<NuevaCuenta> = {
    campos: {
        codigo: { requerido: true },
        nombre: { requerido: true },
        codigoEpigrafe: { requerido: true },
        ejercicioId: { requerido: true },
    },
};

export const nuevaCuentaInicial = (ejercicioId: string): NuevaCuenta => ({
    codigo: "",
    nombre: "",
    codigoEpigrafe: "",
    ejercicioId,
});
