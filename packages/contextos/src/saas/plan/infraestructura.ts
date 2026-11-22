import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "../comun/urls.js";
import { sinCuerpo } from "../comun/infraestructura.js";
import { ModoMcp, ModoModulo, Plan, PlanLimite, PlanModulo, Precio } from "./diseño.js";

export interface PrecioApi { mensual: string; anual: string }

interface PlanModuloApi {
    modulo_id: string;
    modo: ModoModulo;
    precio: PrecioApi | null;
    opciones?: { mcp_modo?: ModoMcp };
}

interface PlanLimiteApi {
    limite_id: string;
    valor: number | null;
    ampliable: boolean;
}

export interface PlanApi {
    id: string;
    nombre: string;
    descripcion: string;
    precio: PrecioApi;
    dias_prueba: number;
    publico: boolean;
    activo: boolean;
    destacado: boolean;
    orden: number;
    modulos: PlanModuloApi[];
    limites: PlanLimiteApi[];
    avisos?: string[];
}

const baseUrl = new ApiUrls().PLAN;

export const precioDesdeApi = (p: PrecioApi | null | undefined): Precio => ({
    mensual: p?.mensual ?? "0.00",
    anual: p?.anual ?? "0.00",
});

const planModuloDesdeApi = (m: PlanModuloApi): PlanModulo => ({
    moduloId: m.modulo_id,
    modo: m.modo,
    precio: m.precio ? precioDesdeApi(m.precio) : null,
    opciones: m.opciones?.mcp_modo ? { mcpModo: m.opciones.mcp_modo } : {},
});

const planLimiteDesdeApi = (l: PlanLimiteApi): PlanLimite => ({
    limiteId: l.limite_id,
    valor: l.valor ?? null,
    ampliable: !!l.ampliable,
});

export const planDesdeApi = (p: PlanApi): Plan => ({
    id: p.id,
    nombre: p.nombre ?? "",
    descripcion: p.descripcion ?? "",
    precio: precioDesdeApi(p.precio),
    diasPrueba: p.dias_prueba ?? 0,
    publico: !!p.publico,
    activo: !!p.activo,
    destacado: !!p.destacado,
    orden: p.orden ?? 0,
    modulos: (p.modulos ?? []).map(planModuloDesdeApi),
    limites: (p.limites ?? []).map(planLimiteDesdeApi),
    avisos: p.avisos ?? [],
});

/** Cuerpo del PUT: el plan completo, sin `id` ni `avisos`. */
export const planAApi = (p: Plan): Omit<PlanApi, "id" | "avisos"> => ({
    nombre: p.nombre,
    descripcion: p.descripcion,
    precio: { mensual: p.precio.mensual, anual: p.precio.anual },
    dias_prueba: p.diasPrueba,
    publico: p.publico,
    activo: p.activo,
    destacado: p.destacado,
    orden: p.orden,
    modulos: p.modulos.map((m) => ({
        modulo_id: m.moduloId,
        modo: m.modo,
        precio: m.precio ? { mensual: m.precio.mensual, anual: m.precio.anual } : null,
        opciones: m.opciones.mcpModo ? { mcp_modo: m.opciones.mcpModo } : {},
    })),
    limites: p.limites.map((l) => ({
        limite_id: l.limiteId,
        valor: l.valor,
        ampliable: l.ampliable,
    })),
});

/** Crea o sustituye el plan (PUT con el plan completo). Devuelve el plan guardado. */
export const putPlan = async (plan: Plan): Promise<Plan> => {
    // RestAPI.put se tipa como void, pero la API responde con el plan en JSON.
    const respuesta = await RestAPI.put(
        `${baseUrl}/${plan.id}`, planAApi(plan), "Error al guardar el plan"
    ) as unknown as PlanApi;
    return planDesdeApi(respuesta);
};

export const postArchivarPlan = async (id: string, activo: boolean): Promise<Plan> => {
    const respuesta = await RestAPI.query<{ activo: boolean }, PlanApi>(
        `${baseUrl}/${id}/archivar`, { activo }, "Error al cambiar el estado del plan"
    );
    return planDesdeApi(respuesta);
};

export const deletePlan = async (id: string): Promise<void> => {
    await sinCuerpo(() => RestAPI.delete(`${baseUrl}/${id}`, "Error al borrar el plan"));
};
