import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { cargarContexto } from "./detalle.ts";
import {
    ContextoDetalleRegularizacionIva,
    EstadoDetalleRegularizacionIva,
} from "./diseño.ts";

export const getMaquina: () => Maquina<
    EstadoDetalleRegularizacionIva,
    ContextoDetalleRegularizacionIva
> = () => {
    return {
        INICIAL: {
            regularizacion_iva_id_cambiada: [cargarContexto],
            regularizacion_iva_deseleccionada: [
                publicar("regularizacion_iva_deseleccionada", null),
            ],
        },

        ABIERTO: {
            borrado_solicitado: "BORRANDO",
            regularizacion_iva_id_cambiada: [cargarContexto],
            regularizacion_iva_deseleccionada: [
                publicar("regularizacion_iva_deseleccionada", null),
            ],
        },

        BORRANDO: {
            regularizacion_iva_borrada: [
                publicar("regularizacion_iva_borrada", null),
                "INICIAL",
            ],
            borrado_cancelado: "ABIERTO",
        },
    };
};
