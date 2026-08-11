import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Modulo } from "../diseño.js";
import { getModulo, getModulos } from "../infraestructura.js";
import { ContextoMaestroModulo, EstadoMaestroModulo } from "./diseño.js";

/**
 * Tipo para todos los handlers del maestro
 */
type ProcesarMaestro = ProcesarContexto<EstadoMaestroModulo, ContextoMaestroModulo>;

/**
 * Patrón: usar accionesListaActivaEntidades para reducir código.
 * Genera automáticamente: cambiar, activar, desactivar, incluir, quitar,
 * recargar, ampliar (paginación incremental), filtrar (cambio de criteria).
 */
const conModulos = (fn: ProcesarListaActivaEntidades<Modulo>) =>
    (ctx: ContextoMaestroModulo) => ({ ...ctx, modulos: fn(ctx.modulos) });

export const Modulos = accionesListaActivaEntidades(conModulos);

/**
 * Recargar lista desde API (reemplaza la lista entera)
 */
export const recargarModulos: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getModulos(criteria);
    return Modulos.recargar(contexto, resultado);
};

/**
 * Ampliar lista (paginación incremental: añade elementos a los existentes)
 * Se usa con el evento "siguiente_pagina"
 */
export const ampliarModulos: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getModulos(criteria);
    return Modulos.ampliar(contexto, resultado);
};

/**
 * Incluir módulo recién creado por ID (flujo con modal CrearModulo)
 * El modal ya realizó el POST; aquí se obtiene la entidad completa y se incluye en la lista.
 */
export const incluirModuloCreadoPorId: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const modulo = await getModulo(id);
    return {
        ...contexto,
        estado: "INICIAL",
        modulos: {
            ...contexto.modulos,
            lista: [modulo, ...contexto.modulos.lista],
            total: contexto.modulos.total + 1,
            activo: modulo.id,
        },
    };
};
