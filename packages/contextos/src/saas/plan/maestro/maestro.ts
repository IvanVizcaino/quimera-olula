import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { getCatalogo } from "../../catalogo/infraestructura.js";
import { Plan } from "../diseño.js";
import { ordenarPlanes, sustituirPlan } from "../dominio.js";
import { ContextoMaestroPlan, EstadoMaestroPlan } from "./diseño.js";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroPlan, ContextoMaestroPlan>;

export const contextoMaestroPlanInicial: ContextoMaestroPlan = {
    estado: "INICIAL",
    planes: [],
    catalogo: null,
    activo: null,
};

export const recargarPlanes: ProcesarMaestro = async (contexto) => {
    const catalogo = await getCatalogo();
    const activo = catalogo.planes.some((p) => p.id === contexto.activo) ? contexto.activo : null;
    return { ...contexto, catalogo, planes: ordenarPlanes(catalogo.planes), activo };
};

export const activarPlan: ProcesarMaestro = async (contexto, payload) => ({
    ...contexto,
    activo: (payload as Plan).id,
});

export const desactivarPlan: ProcesarMaestro = async (contexto) => ({ ...contexto, activo: null });

export const cambiarPlan: ProcesarMaestro = async (contexto, payload) => ({
    ...contexto,
    planes: sustituirPlan(contexto.planes, payload as Plan),
});

export const quitarPlan: ProcesarMaestro = async (contexto, payload) => {
    const id = (payload as Plan).id;
    return {
        ...contexto,
        planes: contexto.planes.filter((p) => p.id !== id),
        activo: contexto.activo === id ? null : contexto.activo,
    };
};

/** Un plan recién creado (o duplicado) entra en la lista y queda seleccionado. */
export const incluirPlanCreado: ProcesarMaestro = async (contexto, payload) => {
    const plan = payload as Plan;
    return {
        ...contexto,
        estado: "INICIAL",
        planes: sustituirPlan(contexto.planes, plan),
        activo: plan.id,
    };
};
