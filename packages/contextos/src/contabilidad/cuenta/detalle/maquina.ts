import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { cargarContexto, refrescarCuenta } from "./detalle.ts";
import { ContextoDetalleCuenta, EstadoDetalleCuenta } from "./diseño.ts";

export const getMaquina: () => Maquina<EstadoDetalleCuenta, ContextoDetalleCuenta> = () => {
    return {
        INICIAL: {
            cuenta_id_cambiada: [cargarContexto],
            cuenta_deseleccionada: [
                publicar('cuenta_deseleccionada', null),
            ],
        },

        ABIERTO: {
            cuenta_guardada: [refrescarCuenta],
            borrado_solicitado: "BORRANDO",
            cuenta_id_cambiada: [cargarContexto],
        },

        BORRANDO: {
            cuenta_borrada: [
                publicar('cuenta_borrada', null),
                "INICIAL",
            ],
            borrado_cancelado: "ABIERTO",
        },
    };
};
