import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { activarSucursal, cargarContexto, refrescarBanco } from "./detalle.ts";
import { ContextoDetalleBanco, EstadoDetalleBanco } from "./diseño.ts";

export const getMaquina: () => Maquina<EstadoDetalleBanco, ContextoDetalleBanco> = () => {
    return {
        INICIAL: {
            banco_id_cambiado: [cargarContexto],
            banco_deseleccionado: [publicar("banco_deseleccionado", null)],
        },

        ABIERTO: {
            banco_guardado: [refrescarBanco],
            borrado_solicitado: "BORRANDO",
            crear_sucursal_solicitado: "CREANDO_SUCURSAL",
            cambiar_sucursal_solicitado: [activarSucursal("CAMBIANDO_SUCURSAL")],
            borrar_sucursal_solicitado: [activarSucursal("BORRANDO_SUCURSAL")],
            banco_id_cambiado: [cargarContexto],
            banco_deseleccionado: [publicar("banco_deseleccionado", null)],
        },

        CREANDO_SUCURSAL: {
            sucursal_creada: [refrescarBanco],
            alta_de_sucursal_cancelada: "ABIERTO",
        },

        CAMBIANDO_SUCURSAL: {
            sucursal_cambiada: [refrescarBanco],
            cambio_de_sucursal_cancelado: "ABIERTO",
        },

        BORRANDO_SUCURSAL: {
            sucursal_borrada: [refrescarBanco],
            borrado_de_sucursal_cancelado: "ABIERTO",
        },

        BORRANDO: {
            banco_borrado: [publicar("banco_borrado", null), "INICIAL"],
            borrado_cancelado: "ABIERTO",
        },
    };
};
