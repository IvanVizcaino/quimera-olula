import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { IaFlujo } from "../diseño.js";
import { getIaFlujo, getIaFlujos } from "../infraestructura.js";
import { ContextoMaestroIaFlujo, EstadoMaestroIaFlujo } from "./diseño.js";

/**
 * Tipo para todos los handlers del maestro
 */
type ProcesarMaestro = ProcesarContexto<EstadoMaestroIaFlujo, ContextoMaestroIaFlujo>;

/**
 * Patrón: usar accionesListaActivaEntidades para reducir código.
 */
const conIaFlujos = (fn: ProcesarListaActivaEntidades<IaFlujo>) =>
    (ctx: ContextoMaestroIaFlujo) => ({ ...ctx, iaFlujos: fn(ctx.iaFlujos) });

export const IaFlujos = accionesListaActivaEntidades(conIaFlujos);

/**
 * Recargar lista desde API (reemplaza la lista entera)
 */
export const recargarIaFlujos: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getIaFlujos(criteria);
    return IaFlujos.recargar(contexto, resultado);
};

/**
 * Ampliar lista (paginación incremental)
 */
export const ampliarIaFlujos: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getIaFlujos(criteria);
    return IaFlujos.ampliar(contexto, resultado);
};

/**
 * Incluir flujo recién creado por ID (flujo con modal CrearIaFlujo)
 */
export const incluirIaFlujoCreadoPorId: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const iaFlujo = await getIaFlujo(id);
    return {
        ...contexto,
        estado: "INICIAL",
        iaFlujos: {
            ...contexto.iaFlujos,
            lista: [iaFlujo, ...contexto.iaFlujos.lista],
            total: contexto.iaFlujos.total + 1,
            activo: iaFlujo.id,
        },
    };
};
