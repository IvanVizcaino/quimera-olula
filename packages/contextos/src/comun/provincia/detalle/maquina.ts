import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { cargarContexto, refrescarProvincia } from "./detalle.ts";
import { ContextoDetalleProvincia, EstadoDetalleProvincia } from "./diseño.ts";

export const getMaquina: () => Maquina<EstadoDetalleProvincia, ContextoDetalleProvincia> = () => {
    return {
        INICIAL: {
            provincia_id_cambiado: [cargarContexto],
            provincia_deseleccionado: [publicar("provincia_deseleccionado", null)],
        },

        ABIERTO: {
            provincia_guardado: [refrescarProvincia],
            borrado_solicitado: "BORRANDO",
            provincia_id_cambiado: [cargarContexto],
            provincia_deseleccionado: [publicar("provincia_deseleccionado", null)],
        },

        BORRANDO: {
            provincia_borrado: [publicar("provincia_borrado", null), "INICIAL"],
            borrado_cancelado: "ABIERTO",
        },
    };
};
