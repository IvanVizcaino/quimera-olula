import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.js";
import { ERR_IBAN_NO_VALIDO, ERR_IBAN_REQUERIDO, ibanValido } from "@olula/lib/iban.js";
import { NuevaCuentaBancaria } from "../diseño.js";

const ibanNuevaCuentaValido = (cuenta: NuevaCuentaBancaria): boolean | string => {
    if (!stringNoVacio(cuenta.iban)) return ERR_IBAN_REQUERIDO;
    if (!ibanValido(cuenta.iban)) return ERR_IBAN_NO_VALIDO;
    return true;
};

export const metaNuevaCuentaBancaria: MetaModelo<NuevaCuentaBancaria> = {
    campos: {
        descripcion: { requerido: false },
        iban: { requerido: true, validacion: ibanNuevaCuentaValido },
    },
};

export const nuevaCuentaBancariaInicial = (): NuevaCuentaBancaria => ({
    descripcion: "",
    iban: "",
});
