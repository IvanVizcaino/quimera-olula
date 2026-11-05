import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { cargarContexto, refrescarSubcuenta } from "./detalle.ts";
import { ContextoDetalleSubcuenta, EstadoDetalleSubcuenta } from "./diseño.ts";

export const getMaquina: () => Maquina<EstadoDetalleSubcuenta, ContextoDetalleSubcuenta> = () => {
    return {
        INICIAL: {
            subcuenta_id_cambiada: [cargarContexto],
            subcuenta_deseleccionada: [
                publicar('subcuenta_deseleccionada', null),
            ],
        },

        ABIERTO: {
            subcuenta_guardada: [refrescarSubcuenta],
            borrado_solicitado: "BORRANDO",
            subcuenta_id_cambiada: [cargarContexto],
        },

        BORRANDO: {
            subcuenta_borrada: [
                publicar('subcuenta_borrada', null),
                "INICIAL",
            ],
            borrado_cancelado: "ABIERTO",
        },
    };
};
