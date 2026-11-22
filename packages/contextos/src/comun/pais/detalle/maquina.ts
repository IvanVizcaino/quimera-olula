import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { cargarContexto, refrescarPais } from "./detalle.ts";
import { ContextoDetallePais, EstadoDetallePais } from "./diseño.ts";

export const getMaquina: () => Maquina<EstadoDetallePais, ContextoDetallePais> = () => {
    return {
        INICIAL: {
            pais_id_cambiado: [cargarContexto],
            pais_deseleccionado: [publicar("pais_deseleccionado", null)],
        },

        ABIERTO: {
            pais_guardado: [refrescarPais],
            borrado_solicitado: "BORRANDO",
            pais_id_cambiado: [cargarContexto],
            pais_deseleccionado: [publicar("pais_deseleccionado", null)],
        },

        BORRANDO: {
            pais_borrado: [publicar("pais_borrado", null), "INICIAL"],
            borrado_cancelado: "ABIERTO",
        },
    };
};
