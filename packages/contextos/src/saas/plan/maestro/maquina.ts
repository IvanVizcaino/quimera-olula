import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroPlan, EstadoMaestroPlan } from "./diseño.js";
import * as maestro from "./maestro.js";

export const getMaquina: () => Maquina<EstadoMaestroPlan, ContextoMaestroPlan> = () => {
    return {
        INICIAL: {
            recarga_de_planes_solicitada: maestro.recargarPlanes,

            plan_seleccionado: maestro.activarPlan,
            plan_deseleccionado: maestro.desactivarPlan,
            plan_cambiado: maestro.cambiarPlan,
            plan_borrado: maestro.quitarPlan,
            plan_creado: maestro.incluirPlanCreado,

            crear_plan_solicitado: "CREANDO",
        },

        CREANDO: {
            alta_de_plan_cancelada: "INICIAL",
            plan_creado: maestro.incluirPlanCreado,
        },
    };
};
