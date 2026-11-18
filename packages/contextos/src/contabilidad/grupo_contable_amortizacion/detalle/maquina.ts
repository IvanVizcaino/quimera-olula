import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { cargarContexto, refrescarGrupo } from "./detalle.ts";
import {
    ContextoDetalleGrupoContableAmortizacion,
    EstadoDetalleGrupoContableAmortizacion,
} from "./diseño.ts";

export const getMaquina: () => Maquina<
    EstadoDetalleGrupoContableAmortizacion,
    ContextoDetalleGrupoContableAmortizacion
> = () => {
    return {
        INICIAL: {
            grupo_id_cambiado: [cargarContexto],
            grupo_deseleccionado: [publicar("grupo_deseleccionado", null)],
        },

        ABIERTO: {
            grupo_guardado: [refrescarGrupo],
            borrado_solicitado: "BORRANDO",
            grupo_id_cambiado: [cargarContexto],
            grupo_deseleccionado: [publicar("grupo_deseleccionado", null)],
        },

        BORRANDO: {
            grupo_borrado: [publicar("grupo_borrado", null), "INICIAL"],
            borrado_cancelado: "ABIERTO",
        },
    };
};
