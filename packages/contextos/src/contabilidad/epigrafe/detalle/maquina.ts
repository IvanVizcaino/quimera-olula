import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { cargarContexto, refrescarEpigrafe } from "./detalle.ts";
import {
    ContextoDetalleEpigrafe,
    EstadoDetalleEpigrafe,
} from "./diseño.ts";

export const getMaquina: () => Maquina<
    EstadoDetalleEpigrafe,
    ContextoDetalleEpigrafe
> = () => {
    return {
        INICIAL: {
            epigrafe_id_cambiado: [cargarContexto],
            epigrafe_deseleccionado: [
                publicar('epigrafe_deseleccionado', null),
            ],
        },

        ABIERTO: {
            epigrafe_guardado: [refrescarEpigrafe],
            borrado_solicitado: "BORRANDO",
            epigrafe_id_cambiado: [cargarContexto],
        },

        BORRANDO: {
            epigrafe_borrado: [
                publicar('epigrafe_borrado', null),
                "INICIAL",
            ],
            borrado_cancelado: "ABIERTO",
        },
    };
};
