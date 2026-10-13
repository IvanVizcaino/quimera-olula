import { ClausulaFiltro, Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import {
    accionesListaActivaEntidades,
    filtrarEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { Cuenta } from "../diseño.ts";
import { getCuentas } from "../infraestructura.ts";
import { EJERCICIO_DEFECTO_CUENTA } from "../dominio.ts";
import { ContextoMaestroCuenta, EstadoMaestroCuenta, ordenDefectoCuenta } from "./diseño.ts";

type ProcesarMaestroCuenta = ProcesarContexto<EstadoMaestroCuenta, ContextoMaestroCuenta>;

const conCuentas =
    (fn: ProcesarListaActivaEntidades<Cuenta>) =>
        (ctx: ContextoMaestroCuenta) => ({ ...ctx, cuentas: fn(ctx.cuentas) });

export const Cuentas = accionesListaActivaEntidades(conCuentas);

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
    orden: ordenDefectoCuenta,
});

export const recargarCuentas: ProcesarMaestroCuenta = async (contexto, payload) => {
    const criteria = (payload as Criteria) ?? contexto.cuentas.criteria;
    const resultado = await getCuentas(criteria);
    return Cuentas.recargar(contexto, resultado);
};

export const cambiarEjercicio: ProcesarMaestroCuenta = async (contexto, payload) => {
    const ejercicioId = (payload as string) || EJERCICIO_DEFECTO_CUENTA;
    const criteria = criteriaConEjercicio(ejercicioId, {
        ...contexto.cuentas.criteria,
        paginacion: { ...contexto.cuentas.criteria.paginacion, pagina: 1 },
    });
    return [
        {
            ...contexto,
            ejercicioId,
            cuentas: filtrarEntidades(contexto.cuentas, criteria),
        },
        [["recarga_solicitada", criteria]],
    ];
};
