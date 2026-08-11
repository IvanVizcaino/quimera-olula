import type { Filtro } from "../diseño.ts";

type LegacyMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type LegacyOrder = {
    field: string;
    direction: "ASC" | "DESC";
};

export type LegacyParams = {
    filter?: unknown;
    page?: unknown;
    order?: LegacyOrder | string | null;
    fields?: string[] | string;
    extra?: Record<string, string | number | boolean | null | undefined>;
};

type LegacyRequestError = {
    nombre: string;
    descripcion: string;
};

const BASE = import.meta.env.VITE_LEGACY_API_URL || "http://127.0.0.1:8005/api/";

const tokenLegacy = () => {
    const tk = localStorage.getItem("token-refresco");
    return tk ? `Token ${tk}` : "";
};

export const legacyQuery = ({ filter, page, order, fields, extra }: LegacyParams = {}) => {
    const params = new URLSearchParams();

    if (filter !== undefined) {
        params.append("filter", JSON.stringify(filter));
    }
    if (page !== undefined) {
        params.append("page", JSON.stringify(page));
    }
    if (fields) {
        params.append("fields", Array.isArray(fields) ? fields.join(",") : fields);
    }
    if (order) {
        if (typeof order === "string") {
            params.append("order", order);
        } else {
            params.append("order", `${order.field} ${order.direction}`);
        }
    }
    if (extra) {
        Object.entries(extra).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        });
    }

    const query = params.toString();
    return query ? `?${query}` : "";
};

const escaped = (value: string) =>
    encodeURIComponent(value.replaceAll("/", "{Slash}").replaceAll(".", "YBPointYB"));

export const legacyUrl = (
    model: string,
    {
        id,
        action,
        staticAction,
        params,
    }: {
        id?: string;
        action?: string;
        staticAction?: boolean;
        params?: LegacyParams;
    } = {}
) => {
    const idPath = id ? `/${escaped(id)}` : "";
    const actionPath = action ? `${staticAction ? "/-static-" : ""}/${action}` : "";
    return `${model}${idPath}${actionPath}${legacyQuery(params)}`;
};

const llamada = async <T>({
    method,
    url,
    headers = {},
    body,
    msgError,
}: {
    method: LegacyMethod;
    url: string;
    headers?: Record<string, string>;
    body?: T;
    msgError?: string;
}): Promise<Response> => {
    const token = tokenLegacy();
    const response = await fetch(`${BASE}${url}`, {
        method,
        headers: {
            ...(method === "GET" || method === "DELETE" ? {} : { "Content-Type": "application/json" }),
            ...(token ? { Authorization: token } : {}),
            ...headers,
        },
        body: method === "GET" || method === "DELETE" ? undefined : JSON.stringify(body ?? {}),
    });

    if (!response.ok) {
        const errorText = await response.text();
        const error: LegacyRequestError = {
            nombre: msgError || `Error ${response.status}`,
            descripcion: errorText,
        };
        return Promise.reject(error);
    }

    return response;
};

const consulta = async <T>(url: string, msgError?: string): Promise<T> =>
    llamada({ method: "GET", url, msgError }).then((r) => r.json() as Promise<T>);

const comando = async <T, U>(
    method: LegacyMethod,
    url: string,
    msgError?: string,
    body?: Partial<T>
): Promise<U> =>
    llamada({ method, url, msgError, body }).then((r) => {
        const contentType = r.headers.get("content-type") || "";
        const textoPlano = contentType.startsWith("text/plain");

        return (textoPlano ? r.text().then((t) => ({ respuesta: t })) : r.json()) as Promise<U>;
    });

export const LegacyAPI = {
    get: <T>(url: string, msgError?: string) => consulta<T>(url, msgError),
    post: <T, U>(url: string, body: T, msgError?: string) => comando<T, U>("POST", url, msgError, body),
    put: <T, U = void>(url: string, body: T, msgError?: string) => comando<T, U>("PUT", url, msgError, body),
    patch: <T, U = void>(url: string, body: Partial<T>, msgError?: string) => comando<T, U>("PATCH", url, msgError, body),
    delete: <U = void>(url: string, msgError?: string) => comando<unknown, U>("DELETE", url, msgError),
    blob: (url: string, msgError?: string) => llamada({ method: "GET", url, msgError }).then((r) => r.blob()),
};

type LegacyClause = [string, string, unknown?];

const isClause = (value: unknown): value is [string, string, unknown?] =>
    Array.isArray(value)
    && typeof value[0] === "string"
    && typeof value[1] === "string";

const flattenFilter = (filter: unknown): [string, string, unknown?][] => {
    if (isClause(filter)) return [filter];

    if (Array.isArray(filter)) {
        return filter.filter(isClause);
    }

    if (filter && typeof filter === "object") {
        if ("and" in filter && Array.isArray((filter as { and?: unknown[] }).and)) {
            return (filter as { and: unknown[] }).and.flatMap((item) => flattenFilter(item));
        }

        if ("or" in filter && Array.isArray((filter as { or?: unknown[] }).or)) {
            return (filter as { or: unknown[] }).or.flatMap((item) => flattenFilter(item));
        }
    }

    return [];
};

const isoLocalDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

const specialDateRange = (value: string): [string, string] | null => {
    const today = new Date();

    const day = today.getDay() || 7;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (day - 1));
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - day));

    switch (value) {
        case "@hoy": {
            const d = isoLocalDate(today);
            return [d, d];
        }
        case "@ayer": {
            const d = new Date(today);
            d.setDate(d.getDate() - 1);
            const s = isoLocalDate(d);
            return [s, s];
        }
        case "@manana":
        case "@mañana": {
            const d = new Date(today);
            d.setDate(d.getDate() + 1);
            const s = isoLocalDate(d);
            return [s, s];
        }
        case "@esta-semana":
            return [isoLocalDate(startOfWeek), isoLocalDate(endOfWeek)];
        case "@semana-anterior": {
            const start = new Date(startOfWeek);
            start.setDate(start.getDate() - 7);
            const end = new Date(endOfWeek);
            end.setDate(end.getDate() - 7);
            return [isoLocalDate(start), isoLocalDate(end)];
        }
        case "@semana-siguiente": {
            const start = new Date(startOfWeek);
            start.setDate(start.getDate() + 7);
            const end = new Date(endOfWeek);
            end.setDate(end.getDate() + 7);
            return [isoLocalDate(start), isoLocalDate(end)];
        }
        default:
            return null;
    }
};

const splitRange = (value: unknown): [string | undefined, string | undefined] => {
    if (typeof value !== "string") return [undefined, undefined];

    if (value.includes("_")) {
        const [from, to] = value.split("_");
        return [from || undefined, to || undefined];
    }

    const special = specialDateRange(value);
    if (special) return special;

    return [value || undefined, undefined];
};

const convertClause = (clause: [string, string, unknown?]): LegacyClause[] => {
    const [field, op, value] = clause;

    if (op === "~") return [[field, "like", value]];
    if (op === ">=") return [[field, "gte", value]];
    if (op === "<=") return [[field, "lte", value]];

    if (op === "=") {
        if (typeof value === "string" && value.startsWith("@")) {
            const [from, to] = splitRange(value);
            return [
                ...(from ? [[field, "gte", from] as LegacyClause] : []),
                ...(to ? [[field, "lte", to] as LegacyClause] : []),
            ];
        }

        return [[field, "eq", value]];
    }

    if (op === "<>") {
        const [from, to] = splitRange(value);
        return [
            ...(from ? [[field, "gte", from] as LegacyClause] : []),
            ...(to ? [[field, "lte", to] as LegacyClause] : []),
        ];
    }

    return [[field, op, value]];
};

export const legacyFilterFromCriteria = (
    filter: Filtro | unknown,
    base: LegacyClause[] = []
) => {
    const criteriaClauses = flattenFilter(filter).flatMap(convertClause);

    return {
        and: [...base, ...criteriaClauses],
    };
};
