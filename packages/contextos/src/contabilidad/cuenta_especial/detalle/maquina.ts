import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { cargarContexto, refrescarCuentaEspecial } from "./detalle.ts";
import {
    ContextoDetalleCuentaEspecial,
    EstadoDetalleCuentaEspecial,
} from "./diseño.ts";

export const getMaquina: () => Maquina<
    EstadoDetalleCuentaEspecial,
    ContextoDetalleCuentaEspecial
> = () => {
    return {
        INICIAL: {
            cuenta_especial_id_cambiada: [cargarContexto],
            cuenta_especial_deseleccionada: [
                publicar('cuenta_especial_deseleccionada', null),
            ],
        },

        ABIERTO: {
            cuenta_especial_guardada: [refrescarCuentaEspecial],
            borrado_solicitado: "BORRANDO",
            cuenta_especial_id_cambiada: [cargarContexto],
        },

        BORRANDO: {
            cuenta_especial_borrada: [
                publicar('cuenta_especial_borrada', null),
                "INICIAL",
            ],
            borrado_cancelado: "ABIERTO",
        },
    };
};
