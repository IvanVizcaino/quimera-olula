import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { Plan } from "../diseño.js";
import { planParaGuardar } from "../dominio.js";
import { postArchivarPlan, putPlan } from "../infraestructura.js";
import { ContextoDetallePlan, EstadoDetallePlan } from "./diseño.js";

type ProcesarDetalle = ProcesarContexto<EstadoDetallePlan, ContextoDetallePlan>;

export const contextoDetallePlanInicial: ContextoDetallePlan = { estado: "ABIERTO" };

/** Guardar = PUT con el plan completo (el borrador llega como payload). El 400 lo muestra el flujo de errores. */
export const guardarPlan: ProcesarDetalle = async (contexto, payload) => {
    const plan = await putPlan(planParaGuardar(payload as Plan));
    return [contexto, [["plan_cambiado", plan]]];
};

export const archivarPlan: ProcesarDetalle = async (contexto, payload) => {
    const { id, activo } = payload as { id: string; activo: boolean };
    const plan = await postArchivarPlan(id, activo);
    return [contexto, [["plan_cambiado", plan]]];
};
