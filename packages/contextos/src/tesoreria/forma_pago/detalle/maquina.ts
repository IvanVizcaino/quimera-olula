import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { cargarContexto, refrescarFormaPago } from "./detalle.ts";
import { ContextoDetalleFormaPago, EstadoDetalleFormaPago } from "./diseño.ts";

export const getMaquina: () => Maquina<EstadoDetalleFormaPago, ContextoDetalleFormaPago> = () => {
    return {
        INICIAL: {
            forma_pago_id_cambiado: [cargarContexto],
            forma_pago_deseleccionada: [publicar("forma_pago_deseleccionada", null)],
        },

        ABIERTO: {
            forma_pago_guardada: [refrescarFormaPago],
            borrado_solicitado: "BORRANDO",
            edicion_de_plazos_solicitada: "EDITANDO_PLAZOS",
            forma_pago_id_cambiado: [cargarContexto],
            forma_pago_deseleccionada: [publicar("forma_pago_deseleccionada", null)],
        },

        EDITANDO_PLAZOS: {
            plazos_guardados: [refrescarFormaPago],
            edicion_de_plazos_cancelada: "ABIERTO",
        },

        BORRANDO: {
            forma_pago_borrada: [publicar("forma_pago_borrada", null), "INICIAL"],
            borrado_cancelado: "ABIERTO",
        },
    };
};
