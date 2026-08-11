import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { ContextoDetalleStock, EstadoDetalleStock } from "./diseño.ts";
import { cargarContexto } from "./dominio.ts";

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
        },
    };
};
