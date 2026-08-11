import { RestAPI } from "./api/rest_api.ts";
import { ClausulaFiltro, Criteria, Filtro, OpcionCampo, Orden, Paginacion } from "./diseño.ts";

export const criteriaAQueryString = (criteria: Criteria): string => {
    return criteriaQuery(criteria.filtro, criteria.orden, criteria.paginacion);
}

export const criteriaQuery = (filtro?: Filtro, orden?: Orden, paginacion?: Paginacion): string => {
    if (!filtro && !orden) {
        return "";
    }

    const criteria = transformarCriteria(filtro, orden, paginacion);
    return aplicarCriteriaUrl(criteria);
}

export const criteriaQueryUrl = (filtro?: Filtro, orden?: Orden): string => {
    if (!filtro && !orden) {
        return "";
    }

    const criteria = transformarCriteria(filtro, orden);
    return aplicarCriteriaUrl(criteria);
}

export const aplicarCriteriaUrl = (criteria: Criteria): string => {
    return `?q=${JSON.stringify(criteria)}`;
}

export const transformarCriteria = (filtro?: Filtro, orden?: Orden, paginacion?: Paginacion): Criteria => {
    const res: Partial<Criteria> = {};
    if (filtro) {
        res['filtro'] = transformarFiltro(filtro);
    }
    if (orden) {
        // res['orden'] = transformarOrden(orden);
        res['orden'] = orden;
    }
    if (paginacion) {
        res['paginacion'] = paginacion;
    }
    return res as Criteria;
}

const hoy = new Date();

export const rangoDesdeAtajo: Record<string, () => [Date, Date]> = {
    "@hoy": () => [hoy, hoy],
    "@ayer": () => {
        const ayer = new Date(hoy);
        ayer.setDate(hoy.getDate() - 1);
        return [ayer, ayer];
    },
    "@mañana": () => {
        const mañana = new Date(hoy);
        mañana.setDate(hoy.getDate() + 1);
        return [mañana, mañana];
    },
    "@esta-semana": () => {
        const dia = hoy.getDay() || 7;

        const primero = new Date(hoy);
        primero.setDate(hoy.getDate() - (dia - 1));

        const ultimo = new Date(hoy);
        ultimo.setDate(hoy.getDate() + (7 - dia));

        return [primero, ultimo];
    },
    "@semana-anterior": () => {
        const dia = hoy.getDay() || 7;

        const primero = new Date(hoy);
        primero.setDate(hoy.getDate() - (dia - 1) - 7);

        const ultimo = new Date(hoy);
        ultimo.setDate(hoy.getDate() + (7 - dia) - 7);

        return [primero, ultimo];
    },
    "@semana-siguiente": () => {
        const dia = hoy.getDay() || 7;

        const primero = new Date(hoy);
        primero.setDate(hoy.getDate() - (dia - 1) + 7);

        const ultimo = new Date(hoy);
        ultimo.setDate(hoy.getDate() + (7 - dia) + 7);

        return [primero, ultimo];
    },
    "@este-mes": () => {
        const primero = new Date(hoy);
        primero.setDate(1);

        const ultimo = new Date(hoy);
        ultimo.setMonth(hoy.getMonth() + 1);
        ultimo.setDate(0);

        return [primero, ultimo];
    },
    "@mes-anterior": () => {
        const primero = new Date(hoy);
        primero.setMonth(hoy.getMonth() - 1);
        primero.setDate(1);

        const ultimo = new Date(hoy);
        ultimo.setDate(0);

        return [primero, ultimo];
    },
    "@mes-siguiente": () => {
        const primero = new Date(hoy);
        primero.setMonth(hoy.getMonth() + 1);
        primero.setDate(1);

        const ultimo = new Date(hoy);
        ultimo.setMonth(hoy.getMonth() + 2);
        ultimo.setDate(0);

        return [primero, ultimo];
    },
    "@este-año": () => {
        const primero = new Date(hoy);
        primero.setMonth(0);
        primero.setDate(1);

        const ultimo = new Date(hoy);
        ultimo.setMonth(11);
        ultimo.setDate(31);

        return [primero, ultimo];
    },
    "@año-anterior": () => {
        const primero = new Date(hoy);
        primero.setFullYear(hoy.getFullYear() - 1)
        primero.setMonth(0);
        primero.setDate(1);

        const ultimo = new Date(hoy);
        ultimo.setFullYear(hoy.getFullYear() - 1)
        ultimo.setMonth(11);
        ultimo.setDate(31);

        return [primero, ultimo];
    },
    "@año-siguiente": () => {
        const primero = new Date(hoy);
        primero.setFullYear(hoy.getFullYear() + 1)
        primero.setMonth(0);
        primero.setDate(1);

        const ultimo = new Date(hoy);
        ultimo.setFullYear(hoy.getFullYear() + 1)
        ultimo.setMonth(11);
        ultimo.setDate(31);

        return [primero, ultimo];
    },
}

const filtrosEspeciales: Record<string, (campo: string) => ClausulaFiltro> = Object.fromEntries(
    Object.entries(rangoDesdeAtajo).map(([atajo, calcularRango]) => [
        atajo,
        (campo: string) => {
            const rango = calcularRango();
            return [campo, "<>", rango.map(d => d.toISOString().slice(0, 10)).join("_")] as ClausulaFiltro;
        },
    ])
)

const transformarFiltrosEspeciales = (clausula: ClausulaFiltro): ClausulaFiltro => {
    const [campo, _, valor] = clausula;

    if (typeof valor !== "string" || !valor.startsWith("@")) return clausula;

    const clausulaFn = filtrosEspeciales[valor as keyof typeof filtrosEspeciales];
    if (!clausulaFn) return clausula;

    return clausulaFn(campo);
}

const transformarFiltro = (filtro: Filtro): Filtro => {
    if (Array.isArray(filtro) && Array.isArray(filtro[0])) {
        return (filtro as ClausulaFiltro[]).map(transformarFiltrosEspeciales);
    }
    if (Array.isArray(filtro)) return transformarFiltrosEspeciales(filtro as ClausulaFiltro);
    if ('or' in filtro) {
        return { or: filtro.or.map(transformarFiltro) };
    }
    return { and: filtro.and.map(transformarFiltro) };
}



export const obtenerOpcionesSelector =
    (path: string) => async () =>
        RestAPI.get<{ datos: [] }>(
            `/cache/comun/${path}`
        ).then((respuesta) => respuesta.datos.map(({ descripcion, ...resto }: Record<string, string>) => [Object.values(resto).at(0), descripcion] as OpcionCampo));
