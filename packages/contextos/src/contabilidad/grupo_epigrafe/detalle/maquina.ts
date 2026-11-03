import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { cargarContexto, refrescarGrupoEpigrafe } from "./detalle.ts";
import {
    ContextoDetalleGrupoEpigrafe,
    EstadoDetalleGrupoEpigrafe,
} from "./diseño.ts";

export const getMaquina: () => Maquina<
    EstadoDetalleGrupoEpigrafe,
    ContextoDetalleGrupoEpigrafe
> = () => {
    return {
        INICIAL: {
            grupo_epigrafe_id_cambiado: [cargarContexto],
            grupo_epigrafe_deseleccionado: [
                publicar('grupo_epigrafe_deseleccionado', null),
            ],
        },

        ABIERTO: {
            grupo_epigrafe_guardado: [refrescarGrupoEpigrafe],
            borrado_solicitado: "BORRANDO",
            grupo_epigrafe_id_cambiado: [cargarContexto],
        },

        BORRANDO: {
            grupo_epigrafe_borrado: [
                publicar('grupo_epigrafe_borrado', null),
                "INICIAL",
            ],
            borrado_cancelado: "ABIERTO",
        },
    };
};
