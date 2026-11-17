import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { anularUltimoPago, cambiarRecibo, cargarContexto, devolverRecibo, pagarRecibo } from "./detalle.js";
import { ContextoDetalleReciboCompra, EstadoDetalleReciboCompra } from "./diseño.js";

export const getMaquina: () => Maquina<EstadoDetalleReciboCompra, ContextoDetalleReciboCompra> = () => {
    return {
        INICIAL: {
            recibo_id_cambiado: [cargarContexto],

            recibo_deseleccionado: [
                publicar('recibo_deseleccionado', null),
            ],
        },

        ABIERTO: {

            traza_solicitada: "VIENDO_TRAZA",

            recibo_id_cambiado: [cargarContexto],

            recibo_deseleccionado: [
                publicar('recibo_deseleccionado', null),
            ],

            ordenar_pago_solicitado: 'ORDENANDO_PAGO',

            pagar_solicitado: 'PAGANDO',

            devolucion_solicitada: 'DEVOLVIENDO',

            cambio_recibo_solicitado: 'CAMBIANDO',

            anulacion_pago_solicitada: 'ANULANDO_PAGO',
        },

        ORDENANDO_PAGO: {
            ordenar_pago_cerrado: 'ABIERTO',
        },

        PAGANDO: {
            pago_confirmado: [pagarRecibo],

            pago_cancelado: 'ABIERTO',
        },

        DEVOLVIENDO: {
            devolucion_confirmada: [devolverRecibo],

            devolucion_cancelada: 'ABIERTO',
        },

        ANULANDO_PAGO: {
            anulacion_pago_confirmada: [anularUltimoPago],

            anulacion_pago_cancelada: 'ABIERTO',
        },

        CAMBIANDO: {
            cambio_recibo_confirmado: [cambiarRecibo],

            cambio_recibo_cancelado: 'ABIERTO',
        },

        VIENDO_TRAZA: {

            traza_cerrada: "ABIERTO",
        },
    };
};
