import { ClausulaFiltro, Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import {
    accionesListaActivaEntidades,
    filtrarEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { Subcuenta } from "../diseño.ts";
import { getSubcuentas } from "../infraestructura.ts";
import { EJERCICIO_DEFECTO_SUBCUENTA } from "../dominio.ts";
import { ContextoMaestroSubcuenta, EstadoMaestroSubcuenta, ordenDefectoSubcuenta } from "./diseño.ts";

type ProcesarMaestroSubcuenta = ProcesarContexto<EstadoMaestroSubcuenta, ContextoMaestroSubcuenta>;

const conSubcuentas =
    (fn: ProcesarListaActivaEntidades<Subcuenta>) =>
        (ctx: ContextoMaestroSubcuenta) => ({ ...ctx, subcuentas: fn(ctx.subcuentas) });

export const Subcuentas = accionesListaActivaEntidades(conSubcuentas);

export const ejercicioIdDesdeCriteria = (criteria: Criteria): string | undefined => {
    const { filtro } = criteria;
    if (!Array.isArray(filtro)) return undefined;
    const clausulas: ClausulaFiltro[] =
        filtro.length === 0 || Array.isArray(filtro[0])
            ? (filtro as ClausulaFiltro[])
            : [filtro as ClausulaFiltro];
    const clausula = clausulas.find(([campo, op]) => campo === "ejercicio_id" && op === "eq");
    return clausula?.[2];
};

export const criteriaConEjercicio = (
    ejercicioId: string,
    base: Criteria = criteriaDefecto,
): Criteria => ({
    ...base,
    filtro: [["ejercicio_id", "eq", ejercicioId]],
    orden: ordenDefectoSubcuenta,
});

export const recargarSubcuentas: ProcesarMaestroSubcuenta = async (contexto, payload) => {
    const criteria = (payload as Criteria) ?? contexto.subcuentas.criteria;
    const resultado = await getSubcuentas(criteria);
    return Subcuentas.recargar(contexto, resultado);
};

export const cambiarEjercicio: ProcesarMaestroSubcuenta = async (contexto, payload) => {
    const ejercicioId = (payload as string) || EJERCICIO_DEFECTO_SUBCUENTA;
    const criteria = criteriaConEjercicio(ejercicioId, {
        ...contexto.subcuentas.criteria,
        paginacion: { ...contexto.subcuentas.criteria.paginacion, pagina: 1 },
    });
    return [
        {
            ...contexto,
            ejercicioId,
            subcuentas: filtrarEntidades(contexto.subcuentas, criteria),
        },
        [["recarga_solicitada", criteria]],
    ];
};
