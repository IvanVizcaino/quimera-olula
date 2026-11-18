import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { cargarContexto, refrescarDivisa } from "./detalle.ts";
import { ContextoDetalleDivisa, EstadoDetalleDivisa } from "./diseño.ts";

export const getMaquina: () => Maquina<EstadoDetalleDivisa, ContextoDetalleDivisa> = () => {
    return {
        INICIAL: {
            divisa_id_cambiado: [cargarContexto],
            divisa_deseleccionado: [publicar("divisa_deseleccionado", null)],
        },

        ABIERTO: {
            divisa_guardado: [refrescarDivisa],
            borrado_solicitado: "BORRANDO",
            divisa_id_cambiado: [cargarContexto],
            divisa_deseleccionado: [publicar("divisa_deseleccionado", null)],
        },

        BORRANDO: {
            divisa_borrado: [publicar("divisa_borrado", null), "INICIAL"],
            borrado_cancelado: "ABIERTO",
        },
    };
};
