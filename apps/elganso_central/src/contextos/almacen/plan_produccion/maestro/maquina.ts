import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroPlanProduccion, EstadoMaestroPlanProduccion } from "./diseño.ts";
import * as maestro from "./maestro.ts";

export const getMaquina: () => Maquina<EstadoMaestroPlanProduccion, ContextoMaestroPlanProduccion> = () => ({
    INICIAL: {
        plan_seleccionado: [maestro.Planes.activar],
        plan_deseleccionado: [maestro.Planes.desactivar],
        plan_cambiado: [maestro.Planes.cambiar],
        plan_borrado: [maestro.Planes.quitar],
        recarga_de_planes_solicitada: maestro.recargarPlanes,
        criteria_cambiado: [maestro.Planes.filtrar, maestro.recargarPlanes],
        siguiente_pagina: [maestro.Planes.filtrar, maestro.ampliarPlanes],
        crear_plan_solicitado: "CREANDO",
    },
    CREANDO: {
        alta_de_plan_cancelada: "INICIAL",
        plan_creado: maestro.incluirPlanCreadoPorId,
    },
});
