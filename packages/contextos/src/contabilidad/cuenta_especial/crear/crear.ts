import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevaCuentaEspecial } from "../diseño.ts";

export const metaNuevaCuentaEspecial: MetaModelo<NuevaCuentaEspecial> = {
    campos: {
        id: { requerido: true, maximo: 6 },
        descripcion: { requerido: true },
        codigoCuenta: { requerido: false },
        codigoSubcuenta: { requerido: false },
    },
};

export const nuevaCuentaEspecialInicial = (): NuevaCuentaEspecial => ({
    id: "",
    descripcion: "",
    codigoCuenta: "",
    codigoSubcuenta: "",
});
