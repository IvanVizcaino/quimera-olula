import { Maquina } from "@olula/lib/diseño.js";
import { publicar } from "@olula/lib/dominio.js";
import { ContextoDetalleComunicacion, EstadoDetalleComunicacion } from "./diseño.ts";
import {
    borrarComunicacionProceso,
    cargarContexto,
    getContextoVacio,
    marcarNoLeidaProceso,
} from "./dominio.ts";

export const getMaquina: () => Maquina<
    EstadoDetalleComunicacion,
    ContextoDetalleComunicacion
> = () => ({
    INICIAL: {
        comunicacion_id_cambiado: [cargarContexto],
        comunicacion_deseleccionada: [
            getContextoVacio,
            publicar("comunicacion_deseleccionada", null),
        ],
    },
    ABIERTO: {
        comunicacion_deseleccionada: [
            getContextoVacio,
            publicar("comunicacion_deseleccionada", null),
        ],
        borrado_solicitado: borrarComunicacionProceso,
        marcado_no_leida_solicitado: marcarNoLeidaProceso,
    },
});