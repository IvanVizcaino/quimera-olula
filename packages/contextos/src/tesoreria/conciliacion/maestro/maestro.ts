import { ClausulaFiltro, Criteria, Filtro, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import {
    MovimientoBancario,
    ResumenConciliacionAutomatica,
    ResumenSincronizacionMovimientoBancario,
} from "../diseño.js";
import { filtroCuentaBanco } from "../dominio.js";
import { getMovimientosBancarios } from "../infraestructura.js";
import { ContextoMaestroConciliacion, EstadoMaestroConciliacion } from "./diseño.js";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroConciliacion, ContextoMaestroConciliacion>;

const conMovimientos = (fn: ProcesarListaActivaEntidades<MovimientoBancario>) =>
    (ctx: ContextoMaestroConciliacion) => ({ ...ctx, movimientos: fn(ctx.movimientos) });

export const Movimientos = accionesListaActivaEntidades(conMovimientos);

/**
 * Añade una cláusula al filtro. El servidor solo admite cláusulas sueltas
 * dentro de una lista o de un `and`, así que no se anida el filtro del usuario.
 */
const conClausula = (filtro: Filtro, clausula: ClausulaFiltro): Filtro => {
    if (Array.isArray(filtro)) {
        const clausulas = filtro.length === 0 || Array.isArray(filtro[0])
            ? filtro as ClausulaFiltro[]
            : [filtro as ClausulaFiltro];
        return [...clausulas, clausula];
    }
    return "and" in filtro ? { and: [...filtro.and, clausula] } : { and: [filtro, clausula] };
};

/**
 * El criteria con el que se consulta: filtros del usuario + filtros de cuadre fijos
 * + la cuenta de la URL.
 */
const criteriaConsulta = (contexto: ContextoMaestroConciliacion, criteria: Criteria): Criteria => {
    let filtro = criteria.filtro;
    for (const clausula of contexto.filtrosCuadre) {
        filtro = conClausula(filtro, clausula);
    }
    filtro = conClausula(filtro, filtroCuentaBanco(contexto.cuentaBancoId));
    return { ...criteria, filtro };
};

export const recargarMovimientos: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getMovimientosBancarios(criteriaConsulta(contexto, criteria));
    return Movimientos.recargar(contexto, resultado);
};

export const ampliarMovimientos: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getMovimientosBancarios(criteriaConsulta(contexto, criteria));
    return Movimientos.ampliar(contexto, resultado);
};

/** Recarga la lista con el criteria actual (patrón `recargarRecibosActual` de recibo_venta). */
export const recargarMovimientosActual: ProcesarMaestro = async (contexto) => {
    const resultado = await getMovimientosBancarios(criteriaConsulta(contexto, contexto.movimientos.criteria));
    return Movimientos.recargar(contexto, resultado);
};

/**
 * Se invoca cuando SincronizarMovimientoBancario.tsx termina la sincronización:
 * recarga la lista con el resultado fresco y guarda el resumen para mostrarlo.
 */
export const aplicarResumenSincronizacion: ProcesarMaestro = async (contexto, payload) => {
    const resumen = payload as ResumenSincronizacionMovimientoBancario;
    const recargado = (await recargarMovimientosActual(contexto)) as ContextoMaestroConciliacion;

    return {
        ...recargado,
        estado: "INICIAL",
        resumenSincronizacion: resumen,
        versionCuadre: recargado.versionCuadre + 1,
    };
};

export const cerrarResumenSincronizacion: ProcesarMaestro = async (contexto) => ({
    ...contexto,
    resumenSincronizacion: null,
});

/** Tras "Conciliar automáticamente": recarga la lista y guarda el resumen para mostrarlo. */
export const aplicarResumenConciliacionAutomatica: ProcesarMaestro = async (contexto, payload) => {
    const resumen = payload as ResumenConciliacionAutomatica;
    const recargado = (await recargarMovimientosActual(contexto)) as ContextoMaestroConciliacion;

    return {
        ...recargado,
        estado: "INICIAL",
        resumenConciliacionAutomatica: resumen,
        versionCuadre: recargado.versionCuadre + 1,
    };
};

export const cerrarResumenConciliacionAutomatica: ProcesarMaestro = async (contexto) => ({
    ...contexto,
    resumenConciliacionAutomatica: null,
});

/**
 * Tras conciliar/desconciliar/ignorar un movimiento individual: actualiza el
 * elemento en la lista y refresca el PanelCuadreBancario (incrementa versionCuadre).
 */
export const aplicarMovimientoCambiado: ProcesarMaestro = async (contexto, payload) => {
    const nuevoCtx = (await Movimientos.cambiar(contexto, payload)) as ContextoMaestroConciliacion;
    return { ...nuevoCtx, versionCuadre: nuevoCtx.versionCuadre + 1 };
};

/**
 * Tras desconciliar un movimiento que el banco ya había eliminado (se borra de la lista):
 * quita el elemento de la lista y refresca el PanelCuadreBancario.
 */
export const aplicarMovimientoBorrado: ProcesarMaestro = async (contexto, payload) => {
    const nuevoCtx = (await Movimientos.quitar(contexto, payload)) as ContextoMaestroConciliacion;
    return { ...nuevoCtx, versionCuadre: nuevoCtx.versionCuadre + 1 };
};

/**
 * Activa un filtro de cuadre llegado por navegación en la misma ruta
 * (badge del PanelCuadreBancario clicado estando ya en la vista de movimientos).
 * El payload lleva { filtrosCuadre, etiquetaCuadre, criteriaBase }.
 */
export const establecerFiltroCuadre: ProcesarMaestro = async (contexto, payload) => {
    const { filtrosCuadre, etiquetaCuadre, criteriaBase } = payload as {
        filtrosCuadre: ClausulaFiltro[];
        etiquetaCuadre: string;
        criteriaBase: Criteria;
    };
    const ctxConCuadre = {
        ...contexto,
        filtrosCuadre,
        etiquetaCuadre,
        movimientos: {
            ...contexto.movimientos,
            criteria: { ...criteriaBase, filtro: [] as ClausulaFiltro[] },
        },
    };
    return recargarMovimientosActual(ctxConCuadre);
};

/**
 * Elimina el filtro de cuadre activo y recarga la lista con el criteria base
 * que viene como payload (criteriaBase del componente).
 * El usuario vuelve al modo libre con los filtros por defecto.
 */
export const limpiarFiltroCuadre: ProcesarMaestro = async (contexto, payload) => {
    const criteriaBase = payload as Criteria;
    const ctxSinCuadre = {
        ...contexto,
        filtrosCuadre: [] as ClausulaFiltro[],
        etiquetaCuadre: null as string | null,
        movimientos: {
            ...contexto.movimientos,
            criteria: criteriaBase,
        },
    };
    return recargarMovimientosActual(ctxSinCuadre);
};
