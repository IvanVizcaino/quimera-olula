import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroCatalogo, EstadoMaestroCatalogo } from "./diseño.js";
import * as maestro from "./maestro.js";

export const getMaquina: () => Maquina<EstadoMaestroCatalogo, ContextoMaestroCatalogo> = () => {
    return {
        INICIAL: {
            recarga_de_catalogo_solicitada: maestro.recargarCatalogo,

            iva_cuotas_cambiado: maestro.guardarIvaCuotas,

            editar_modulo_solicitado: [maestro.seleccionarModulo, "EDITANDO_MODULO"],

            alta_de_limite_solicitada: [maestro.seleccionarLimite, "EDITANDO_LIMITE"],
            editar_limite_solicitado: [maestro.seleccionarLimite, "EDITANDO_LIMITE"],
            borrar_limite_solicitado: [maestro.seleccionarLimite, "BORRANDO_LIMITE"],

            alta_de_extra_solicitada: [maestro.seleccionarExtra, "EDITANDO_EXTRA"],
            editar_extra_solicitado: [maestro.seleccionarExtra, "EDITANDO_EXTRA"],
            borrar_extra_solicitado: [maestro.seleccionarExtra, "BORRANDO_EXTRA"],
        },

        EDITANDO_MODULO: {
            modulo_guardado: maestro.recargarCatalogo,
            edicion_cancelada: "INICIAL",
        },

        EDITANDO_LIMITE: {
            limite_guardado: maestro.recargarCatalogo,
            edicion_cancelada: "INICIAL",
        },

        BORRANDO_LIMITE: {
            limite_borrado: maestro.recargarCatalogo,
            borrado_cancelado: "INICIAL",
        },

        EDITANDO_EXTRA: {
            extra_guardado: maestro.recargarCatalogo,
            edicion_cancelada: "INICIAL",
        },

        BORRANDO_EXTRA: {
            extra_borrado: maestro.recargarCatalogo,
            borrado_cancelado: "INICIAL",
        },
    };
};
