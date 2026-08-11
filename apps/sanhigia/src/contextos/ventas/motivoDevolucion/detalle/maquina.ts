import { Maquina } from "@olula/lib/diseño.js";
import { publicar } from "@olula/lib/dominio.js";
import {
    ContextoDetalleMotivoDevolucion,
    EstadoDetalleMotivoDevolucion,
} from "./diseño.ts";
import {
    cambiarMotivoDevolucion,
    cargarContexto,
    getContextoVacio,
} from "./dominio.ts";

export const getMaquina: () => Maquina<
    EstadoDetalleMotivoDevolucion,
    ContextoDetalleMotivoDevolucion
> = () => ({
    INICIAL: {
        motivo_devolucion_id_cambiado: cargarContexto,
        motivo_devolucion_cambiado: cambiarMotivoDevolucion,
        edicion_motivo_devolucion_cancelada: [
            getContextoVacio,
            publicar("motivo_devolucion_deseleccionado", null),
        ],
        borrado_motivo_devolucion_solicitado: "BORRANDO",
    },
    BORRANDO: {
        borrado_motivo_devolucion_cancelado: "INICIAL",
        motivo_devolucion_borrado: [
            getContextoVacio,
            publicar("motivo_devolucion_borrado", (_, motivoDevolucionId) =>
                motivoDevolucionId
            ),
        ],
    },
});