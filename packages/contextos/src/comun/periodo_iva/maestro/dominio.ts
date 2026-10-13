import { ClausulaFiltro, Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import {
    accionesListaActivaEntidades,
    filtrarEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { PeriodoIva } from "../diseño.ts";
import { getPeriodosIva } from "../infraestructura.ts";
import { ContextoMaestroPeriodoIva, EstadoMaestroPeriodoIva, ordenDefectoPeriodoIva } from "./diseño.ts";

type ProcesarMaestroPeriodoIva = ProcesarContexto<
    EstadoMaestroPeriodoIva,
    ContextoMaestroPeriodoIva
>;

const conPeriodos =
    (fn: ProcesarListaActivaEntidades<PeriodoIva>) =>
        (ctx: ContextoMaestroPeriodoIva) => ({ ...ctx, periodos: fn(ctx.periodos) });

export const PeriodosIva = accionesListaActivaEntidades(conPeriodos);

export const impuestoIdDesdeCriteria = (criteria: Criteria): string | undefined => {
    const { filtro } = criteria;
    if (!Array.isArray(filtro)) return undefined;
    const clausulas: ClausulaFiltro[] =
        filtro.length === 0 || Array.isArray(filtro[0])
            ? (filtro as ClausulaFiltro[])
            : [filtro as ClausulaFiltro];
    const clausula = clausulas.find(([campo, op]) => campo === "impuesto_id" && op === "eq");
    return clausula?.[2];
};

export const criteriaConImpuesto = (impuestoId: string, base: Criteria = criteriaDefecto): Criteria => ({
    ...base,
    filtro: [["impuesto_id", "eq", impuestoId]],
    orden: base.orden?.length ? base.orden : ordenDefectoPeriodoIva,
});

export const recargarPeriodosIva: ProcesarMaestroPeriodoIva = async (contexto, payload) => {
    const criteria = (payload as Criteria) ?? contexto.periodos.criteria;
    const resultado = await getPeriodosIva(criteria);
    return PeriodosIva.recargar(contexto, resultado);
};

export const cambiarImpuesto: ProcesarMaestroPeriodoIva = async (contexto, payload) => {
    const impuestoId = payload as string;
    const criteria = criteriaConImpuesto(impuestoId, {
        ...contexto.periodos.criteria,
        paginacion: { ...contexto.periodos.criteria.paginacion, pagina: 1 },
    });
    return [
        {
            ...contexto,
            impuestoId,
            periodos: filtrarEntidades(contexto.periodos, criteria),
        },
        [["recarga_solicitada", criteria]],
    ];
};
