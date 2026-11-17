import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { cargarContexto, deshacerPagoProceso, pagarRemesaProceso } from "./detalle.js";
import { ContextoDetalleRemesa, EstadoDetalleRemesa } from "./diseño.js";

export const getMaquina: () => Maquina<EstadoDetalleRemesa, ContextoDetalleRemesa> = () => {
    return {
        INICIAL: {
            remesa_id_cambiado: [cargarContexto],

            remesa_deseleccionada: [
                publicar('remesa_deseleccionada', null),
            ],
        },

        ABIERTO: {
            remesa_id_cambiado: [cargarContexto],

            remesa_deseleccionada: [
                publicar('remesa_deseleccionada', null),
            ],

            pago_solicitado: 'PAGANDO',

            deshacer_pago_solicitado: 'DESHACIENDO_PAGO',

            fichero_solicitado: 'GENERANDO_FICHERO',
        },

        GENERANDO_FICHERO: {
            fichero_cerrado: 'ABIERTO',
        },

        PAGANDO: {
            pago_confirmado: [pagarRemesaProceso],

            pago_cancelado: 'ABIERTO',
        },

        DESHACIENDO_PAGO: {
            deshacer_pago_confirmado: [deshacerPagoProceso],

            deshacer_pago_cancelado: 'ABIERTO',
        },
    };
};
