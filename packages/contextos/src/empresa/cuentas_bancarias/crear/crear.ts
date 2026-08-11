import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevaCuentaBancaria } from "../diseño.js";

export const metaNuevaCuentaBancaria: MetaModelo<NuevaCuentaBancaria> = {
    campos: {
        codigoCuenta: { requerido: true },
        paisId: { requerido: true },
        descripcion: { requerido: false },
        iban: { requerido: false },
        bic: { requerido: false },
        entidad: { requerido: false },
        agencia: { requerido: false },
        digitoControl: { requerido: false },
        cuenta: { requerido: false },
        empresaId: { requerido: false },
    },
};

export const nuevaCuentaBancariaInicial = (): NuevaCuentaBancaria => ({
    codigoCuenta: "",
    paisId: "",
    empresaId: "",
    descripcion: "",
    iban: "",
    bic: "",
    entidad: "",
    agencia: "",
    digitoControl: "",
    cuenta: "",
});
