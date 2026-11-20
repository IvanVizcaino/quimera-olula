import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import * as detalle from "./detalle.js";
import { ContextoDetallePlan, EstadoDetallePlan } from "./diseño.js";

export const getMaquina: () => Maquina<EstadoDetallePlan, ContextoDetallePlan> = () => {
    return {
        ABIERTO: {
            plan_deseleccionado: [publicar("plan_deseleccionado", null)],

            guardar_solicitado: detalle.guardarPlan,
            archivar_solicitado: detalle.archivarPlan,

            borrar_solicitado: "BORRANDO",
            duplicar_solicitado: "DUPLICANDO",
        },

        BORRANDO: {
            borrado_confirmado: [publicar("plan_borrado", (_, plan) => plan), "ABIERTO"],
            borrado_cancelado: "ABIERTO",
        },

        DUPLICANDO: {
            plan_duplicado: [publicar("plan_creado", (_, plan) => plan), "ABIERTO"],
            duplicado_cancelado: "ABIERTO",
        },
    };
};
