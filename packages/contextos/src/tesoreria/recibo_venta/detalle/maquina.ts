import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { anularUltimoPago, cambiarRecibo, cargarContexto, desagruparRecibo, devolverRecibo, pagarRecibo } from "./detalle.js";
import { ContextoDetalleReciboVenta, EstadoDetalleReciboVenta } from "./diseño.js";

export const getMaquina: () => Maquina<EstadoDetalleReciboVenta, ContextoDetalleReciboVenta> = () => {
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

            pagar_solicitado: 'PAGANDO',

            enlace_cobro_solicitado: 'ENLACE_COBRO',

            enlace_tarjeta_solicitado: 'ENLACE_TARJETA',

            devolucion_solicitada: 'DEVOLVIENDO',

            cambio_recibo_solicitado: 'CAMBIANDO',

            anulacion_pago_solicitada: 'ANULANDO_PAGO',

            desagrupado_solicitado: 'DESAGRUPANDO',
        },

        PAGANDO: {
            pago_confirmado: [pagarRecibo],

            pago_cancelado: 'ABIERTO',
        },

        ENLACE_COBRO: {
            enlace_cobro_cerrado: 'ABIERTO',
        },

        ENLACE_TARJETA: {
            enlace_tarjeta_cerrado: 'ABIERTO',
        },

        DEVOLVIENDO: {
            devolucion_confirmada: [devolverRecibo],

            devolucion_cancelada: 'ABIERTO',
        },

        DESAGRUPANDO: {
            desagrupado_confirmado: [desagruparRecibo],

            desagrupado_cancelado: 'ABIERTO',
        },

        CAMBIANDO: {
            cambio_recibo_confirmado: [cambiarRecibo],

            cambio_recibo_cancelado: 'ABIERTO',
        },

        ANULANDO_PAGO: {
            anulacion_pago_confirmada: [anularUltimoPago],

            anulacion_pago_cancelada: 'ABIERTO',
        },

        VIENDO_TRAZA: {

            traza_cerrada: "ABIERTO",
        },
    };
};
