import { MetaModelo } from "@olula/lib/dominio.js";
import { PagoReciboCompra } from "./diseño.js";

export const pagoReciboCompraVacio: PagoReciboCompra = {
    cuenta_pago_id: "",
    nombre_cuenta_pago: "",
    fecha: new Date(),
};

export const metaPagoReciboCompra: MetaModelo<PagoReciboCompra> = {
    campos: {
        cuenta_pago_id: { requerido: true },
        fecha: { tipo: "fecha", requerido: true },
    },
};
