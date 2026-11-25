import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { ContextoDetalleStock, EstadoDetalleStock } from "./diseño.ts";
import { activarRegularizacion, cargarContexto, refrescarStock } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoDetalleStock, ContextoDetalleStock> = () => {
    return {
        INICIAL: {
            stock_id_cambiado: [cargarContexto],

            stock_deseleccionado: [
                publicar("stock_deseleccionado", null),
            ],
        },

        ABIERTO: {
            stock_id_cambiado: [cargarContexto],

            stock_deseleccionado: [
                publicar("stock_deseleccionado", null),
            ],

            regularizar_solicitado: "REGULARIZANDO",

            borrar_regularizacion_solicitado: [
                activarRegularizacion,
                "BORRANDO_REGULARIZACION",
            ],
        },

        REGULARIZANDO: {
            stock_regularizado: [refrescarStock],
            regularizacion_cancelada: "ABIERTO",
        },

        BORRANDO_REGULARIZACION: {
            regularizacion_borrada: [refrescarStock],
            borrado_regularizacion_cancelado: "ABIERTO",
        },
    };
};
