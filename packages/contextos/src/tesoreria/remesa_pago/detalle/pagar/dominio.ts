import { MetaModelo } from "@olula/lib/dominio.js";
import { PagoRemesaPago } from "./diseño.js";

export const pagoRemesaPagoVacio = (): PagoRemesaPago => ({
    fecha: new Date(),
    iban: "",
    numero_cheque: "",
});

export const metaPagoRemesaPago: MetaModelo<PagoRemesaPago> = {
    campos: {
        fecha: { tipo: "fecha", requerido: true },
        iban: {},
        numero_cheque: {},
    },
};
