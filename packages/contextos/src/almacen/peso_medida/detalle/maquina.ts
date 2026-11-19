import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { PesoMedida } from "../diseño.ts";
import { cargarContexto, refrescarPesoMedida } from "./detalle.ts";

export type EstadoDetallePesoMedida = "INICIAL" | "ABIERTO" | "BORRANDO";

export type ContextoDetallePesoMedida = {
    estado: EstadoDetallePesoMedida;
    pesoMedida: PesoMedida;
};

export const getMaquina: () => Maquina<EstadoDetallePesoMedida, ContextoDetallePesoMedida> = () => ({
    INICIAL: {
        peso_medida_id_cambiado: [cargarContexto],
        peso_medida_deseleccionada: [publicar("peso_medida_deseleccionada", null)],
    },
    ABIERTO: {
        peso_medida_id_cambiado: [cargarContexto],
        peso_medida_guardada: [refrescarPesoMedida],
        borrado_solicitado: "BORRANDO",
        peso_medida_deseleccionada: [publicar("peso_medida_deseleccionada", null)],
    },
    BORRANDO: {
        peso_medida_borrada: [publicar("peso_medida_borrada", null), "INICIAL"],
        borrado_cancelado: "ABIERTO",
    },
});
