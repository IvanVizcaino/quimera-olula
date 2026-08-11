import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { IaMemoria } from "../diseño.js";
import { getIaMemoria, getIaMemorias } from "../infraestructura.js";
import { ContextoMaestroIaMemoria, EstadoMaestroIaMemoria } from "./diseño.js";

/**
 * Tipo para todos los handlers del maestro
 */
type ProcesarMaestro = ProcesarContexto<EstadoMaestroIaMemoria, ContextoMaestroIaMemoria>;

/**
 * Patrón: usar accionesListaActivaEntidades para reducir código.
 */
const conIaMemorias = (fn: ProcesarListaActivaEntidades<IaMemoria>) =>
    (ctx: ContextoMaestroIaMemoria) => ({ ...ctx, iaMemorias: fn(ctx.iaMemorias) });

export const IaMemorias = accionesListaActivaEntidades(conIaMemorias);

/**
 * Recargar lista desde API (reemplaza la lista entera)
 */
export const recargarIaMemorias: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getIaMemorias(criteria);
    return IaMemorias.recargar(contexto, resultado);
};

/**
 * Ampliar lista (paginación incremental)
 */
export const ampliarIaMemorias: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getIaMemorias(criteria);
    return IaMemorias.ampliar(contexto, resultado);
};

/**
 * Incluir memoria recién creada por ID (flujo con modal CrearIaMemoria)
 */
export const incluirIaMemoriaCreadaPorId: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const iaMemoria = await getIaMemoria(id);
    return {
        ...contexto,
        estado: "INICIAL",
        iaMemorias: {
            ...contexto.iaMemorias,
            lista: [iaMemoria, ...contexto.iaMemorias.lista],
            total: contexto.iaMemorias.total + 1,
            activo: iaMemoria.id,
        },
    };
};
