import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { cargarContexto, refrescarAgente } from "./detalle.js";
import { ContextoDetalleAgente, EstadoDetalleAgente } from "./diseño.js";

export const getMaquina: () => Maquina<EstadoDetalleAgente, ContextoDetalleAgente> = () => {
    return {
        INICIAL: {
            agente_id_cambiado: [cargarContexto],

            agente_deseleccionado: [
                publicar('agente_deseleccionado', null),
            ],
        },

        ABIERTO: {
            agente_guardado: [refrescarAgente],

            agente_id_cambiado: [cargarContexto],
        },
    };
};
