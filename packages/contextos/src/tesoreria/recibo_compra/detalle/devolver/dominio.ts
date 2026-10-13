import { MetaModelo } from "@olula/lib/dominio.js";
import { ReciboCompra } from "../../diseño.js";
import { cuentaUltimoPagoCompra } from "../../dominio.js";
import { DevolucionReciboCompra } from "./diseño.js";

/** La cuenta se precarga con la del último pago y no se puede cambiar. */
export const devolucionReciboCompraVacia = (recibo: ReciboCompra): DevolucionReciboCompra => {
    const cuenta = cuentaUltimoPagoCompra(recibo);
    return {
        cuenta_pago_id: cuenta?.id ?? "",
        nombre_cuenta_pago: cuenta?.nombre ?? "",
        fecha: new Date(),
        iban: "",
        numero_cheque: "",
    };
};

export const metaDevolucionReciboCompra: MetaModelo<DevolucionReciboCompra> = {
    campos: {
        cuenta_pago_id: { requerido: true },
        fecha: { tipo: "fecha", requerido: true },
        iban: {},
        numero_cheque: {},
    },
};
