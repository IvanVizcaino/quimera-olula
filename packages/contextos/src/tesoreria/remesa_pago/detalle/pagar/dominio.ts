import { MetaModelo } from "@olula/lib/dominio.js";
import { PagoRemesaPagoForm } from "./diseño.js";

/** Se propone la fecha de pago prevista de la remesa; si ya pasó, hoy. */
export const pagoRemesaPagoInicial = (fechaPrevista: Date | null): PagoRemesaPagoForm => {
    const hoy = new Date();
    return { fecha: fechaPrevista && fechaPrevista > hoy ? fechaPrevista : hoy };
};

export const metaPagoRemesaPago: MetaModelo<PagoRemesaPagoForm> = {
    campos: {
        fecha: { tipo: "fecha", requerido: true },
    },
};
