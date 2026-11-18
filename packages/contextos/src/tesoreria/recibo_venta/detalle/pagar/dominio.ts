import { MetaModelo } from "@olula/lib/dominio.js";
import { PagoRecibo } from "./diseño.js";

export const pagoReciboVacio: PagoRecibo = {
    cuenta_pago_id: "",
    nombre_cuenta_pago: "",
    fecha: new Date(),
    tasa_conversion: 0,
};

/** En divisa extranjera la tasa de cambio es obligatoria. */
export const metaPagoRecibo = (enDivisa: boolean): MetaModelo<PagoRecibo> => ({
    campos: {
        cuenta_pago_id: { requerido: true },
        fecha: { tipo: "fecha", requerido: true },
        tasa_conversion: {
            tipo: "numero",
            requerido: enDivisa,
            validacion: (m) => !enDivisa || m.tasa_conversion > 0
                ? true : "La tasa de cambio debe ser mayor que 0",
        },
    },
});
