import { useEffect } from "react";
import { ClausulaFiltro, Criteria, Paginacion } from "./diseño.js";

const formarUrl = (params: URLSearchParams) => {
    const str = params.toString();
    const base = window.location.origin + window.location.pathname;
    const url = base + (str.length ? "?" + str : "");

    return url;
}

export const getIdUrlParams = () => {
    const params = new URLSearchParams(window.location.search);

    return params.get("id") ?? undefined;
};

export const setIdUrlParams = (id: string | undefined) => {
    const params = new URLSearchParams(window.location.search);

    if (!id) params.delete("id");
    else params.set("id", id);

    history.replaceState({}, "", formarUrl(params));
}

const clavesReservadas = ["id", "modo", "orden", "p", "l", "_label"];

export const filtroDefecto: ClausulaFiltro[] = [];

const getFiltro = (params: URLSearchParams) => {
    const filtro = [...filtroDefecto];

    for (const [k, v] of params.entries()) {
        if (clavesReservadas.includes(k)) continue;

        const valor = v.split("__");

        if (valor.length === 2) {
            const operador = valor[0];
            const valorStr = valor[1];

            // Soportar arrays para operadores 'in' y '!in'
            if ((operador === "in" || operador === "!in") && valorStr.includes(",")) {
                const valorArray = valorStr.split(",");
                filtro.push([k, operador, valorArray as unknown as string]);
            } else {
                filtro.push([k, operador, valorStr]);
            }
        }
        else filtro.push([k, "~", v])
    }

    return filtro;
};

const setFiltro = (criteria: Criteria, params: URLSearchParams) => {
    const { filtro } = criteria;

    if (!Array.isArray(filtro)) return;

    // `Filtro` can be either a single clause tuple or a list of tuples.
    // Normalize to a list to avoid iterating tuple elements as strings.
    const clausulas: ClausulaFiltro[] =
        filtro.length === 0 || Array.isArray(filtro[0])
            ? (filtro as ClausulaFiltro[])
            : [filtro as ClausulaFiltro];

    clausulas.forEach(f => {
        const [campoFiltro, operador, valor] = f;

        if (valor === undefined) {
            params.append(campoFiltro, operador)
        } else if (operador === "~") {
            params.append(campoFiltro, valor ?? "");
        } else if ((operador === "in" || operador === "!in") && Array.isArray(valor)) {
            // Para operadores 'in' y '!in' con arrays, serializar como valores separados por comas
            params.append(campoFiltro, operador + "__" + (valor as string[]).join(","));
        } else {
            params.append(campoFiltro, operador + "__" + valor);
        }
    });
}

export const ordenDefecto = ["id", "DESC"];

const getOrden = (params: URLSearchParams, ordenDefectoPropio: string[] = ordenDefecto) => {
    const orden = params.get("orden");
    if (!orden) return ordenDefectoPropio;

    return orden.split(",").flatMap(campo =>
        campo.startsWith("-") ? [campo.slice(1), "DESC"] : [campo, "ASC"]
    );
};

const setOrden = (criteria: Criteria, params: URLSearchParams, ordenDefectoPropio: string[] = ordenDefecto) => {
    const { orden } = criteria;

    if (orden.toString() === ordenDefectoPropio.toString()) return;

    const partes: string[] = [];
    for (let i = 0; i < orden.length; i += 2) {
        partes.push(orden[i + 1] === "ASC" ? orden[i] : "-" + orden[i]);
    }
    params.set("orden", partes.join(","));
}

export const paginacionDefecto = { pagina: 1, limite: 100 };

const getPaginacion = (params: URLSearchParams): Paginacion => {
    const p = parseInt(params.get("p") ?? paginacionDefecto.pagina.toString());
    const l = parseInt(params.get("l") ?? paginacionDefecto.limite.toString());

    const pagina = !isNaN(p) ? p : paginacionDefecto.pagina;
    const limite = !isNaN(l) ? l : paginacionDefecto.limite;

    return { pagina, limite };
};

const setPaginacion = (criteria: Criteria, params: URLSearchParams) => {
    const { paginacion: { limite, pagina } } = criteria;

    if (limite && limite !== paginacionDefecto.limite) params.set("l", limite.toString());
    if (pagina && pagina !== paginacionDefecto.pagina) params.set("p", pagina.toString());
}

export const getCriteriaUrlParams = (ordenDefectoPropio?: string[]) => {
    const params = new URLSearchParams(window.location.search);

    return {
        filtro: getFiltro(params),
        orden: getOrden(params, ordenDefectoPropio),
        paginacion: getPaginacion(params),
    }
}

export const setCriteriaUrlParams = (criteria: Criteria, ordenDefectoPropio?: string[]) => {
    const previo = new URLSearchParams(window.location.search);
    const id = previo.get("id");
    const modo = previo.get("modo");

    const params = new URLSearchParams();
    if (id) params.set("id", id);
    if (modo) params.set("modo", modo);

    setFiltro(criteria, params);
    setOrden(criteria, params, ordenDefectoPropio);
    setPaginacion(criteria, params);

    history.replaceState({}, "", formarUrl(params));
}

export const getUrlParams = (ordenDefectoPropio?: string[]) => {
    const id = getIdUrlParams();
    const criteria = getCriteriaUrlParams(ordenDefectoPropio);

    return { id, criteria };
}

// `ordenDefectoPropio`: para maestros con un orden por defecto propio
// (distinto del genérico `ordenDefecto`, ej. fecha/hora en vez de id) — así
// la URL se queda limpia (sin `orden=...`) cuando el criteria coincide con
// ESE default, en vez de compararlo siempre contra el genérico.
export const useUrlParams = (id: string | undefined, criteria: Criteria, ordenDefectoPropio?: string[]) => {
    useEffect(() => {
        setIdUrlParams(id);
    }, [id]);

    useEffect(() => {
        setCriteriaUrlParams(criteria, ordenDefectoPropio);
    }, [criteria])
}