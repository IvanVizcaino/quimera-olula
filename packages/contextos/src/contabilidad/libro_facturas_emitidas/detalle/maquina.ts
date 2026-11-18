import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import {
    calcularResultado,
    cargarContexto,
    refrescarInforme,
} from "./detalle.ts";
import {
    ContextoDetalleLibroFacturasEmitidas,
    EstadoDetalleLibroFacturasEmitidas,
} from "./diseño.ts";

export const getMaquina: () => Maquina<
    EstadoDetalleLibroFacturasEmitidas,
    ContextoDetalleLibroFacturasEmitidas
> = () => {
    return {
        INICIAL: {
            informe_id_cambiado: [cargarContexto],
            informe_deseleccionado: [publicar("informe_deseleccionado", null)],
        },

        ABIERTO: {
            informe_guardado: [refrescarInforme],
            calculo_solicitado: [calcularResultado],
            borrado_solicitado: "BORRANDO",
            informe_id_cambiado: [cargarContexto],
        },

        BORRANDO: {
            informe_borrado: [publicar("informe_borrado", null), "INICIAL"],
            borrado_cancelado: "ABIERTO",
        },
    };
};
