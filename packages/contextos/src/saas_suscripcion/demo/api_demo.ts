/**
 * API en memoria para las demos de «Módulos disponibles». Las pantallas reales del módulo
 * hablan con ella en lugar de con el servidor (ver entorno_demo.ts): cada colección es una
 * lista de registros con `id` y se puede listar, abrir, crear, cambiar y borrar. Nada sale
 * del navegador y al cerrar la demo se pierde todo.
 *
 * Formato de respuesta como el del servidor: listas `{datos, total}`, registro `{datos}`,
 * alta `{id}`. Lo que no esté en los datos de la demo responde con una lista vacía, que las
 * pantallas saben pintar.
 */

export type Registro = Record<string, unknown> & { id: string };

export type Colecciones = Record<string, Registro[]>;

export interface RespuestaDemo {
    estado: number;
    cuerpo: unknown;
    /** No había datos para esa ruta: se ha respondido vacío (sirve para completar la demo). */
    sinDatos?: boolean;
}

/**
 * Respuesta fija para lo que no es una colección (agregados, previsiones, el chat del
 * asistente…). `ruta` es la ruta sin prefijo ni query ("analisis/cubo/ventas") o una
 * expresión regular sobre ella. `cuerpo` puede ser una función de la petición.
 */
/** Lo que recibe una respuesta fija calculada: puede leer y cambiar las colecciones. */
export interface PeticionDemo {
    url: string;
    ruta: string;
    /** Tramos de la ruta ("tpv/venta/v1/linea" → ["tpv", "venta", "v1", "linea"]). */
    tramos: string[];
    cuerpo: unknown;
    colecciones: Colecciones;
    /** Id nuevo para lo que se cree en la demo. */
    nuevoId: () => string;
}

export interface RespuestaFija {
    metodo: string;
    ruta: string | RegExp;
    cuerpo: unknown | ((peticion: PeticionDemo) => unknown);
}

type Criteria = {
    orden?: string[];
    paginacion?: { limite: number; pagina: number };
};

const VACIA = { datos: [], total: 0 };

/** Ruta sin el prefijo de la API ni la query: "/_api/crm/accion/3?q=…" → "crm/accion/3". */
export const rutaDeUrl = (url: string, base = ""): string => {
    const sinOrigen = url.replace(/^[a-z]+:\/\/[^/]+/i, "");
    const sinBase = base && sinOrigen.startsWith(base) ? sinOrigen.slice(base.length) : sinOrigen;
    return sinBase.split("?")[0].replace(/^\/+|\/+$/g, "");
};

const criteriaDeUrl = (url: string): Criteria => {
    const q = new URL(url, "http://demo").searchParams.get("q");
    if (!q) return {};
    try {
        return JSON.parse(q) as Criteria;
    } catch {
        return {};
    }
};

/** Orden del servidor: ["campo", "ASC"|"DESC", ...]. Comparación de textos con números. */
const ordenar = (registros: Registro[], orden: string[] | undefined): Registro[] => {
    if (!orden?.length) return registros;
    const [campo, sentido] = orden;
    const signo = String(sentido).toUpperCase() === "DESC" ? -1 : 1;
    return [...registros].sort((a, b) =>
        signo * String(a[campo] ?? "").localeCompare(String(b[campo] ?? ""), "es", { numeric: true }));
};

const paginar = (registros: Registro[], paginacion: Criteria["paginacion"]): Registro[] => {
    if (!paginacion?.limite) return registros;
    const inicio = Math.max(0, (paginacion.pagina - 1) * paginacion.limite);
    return registros.slice(inicio, inicio + paginacion.limite);
};

/** La colección más larga que es prefijo de la ruta y, si sobra un tramo, el id. */
const resolver = (colecciones: Colecciones, ruta: string): { coleccion: string; id: string | null } | null => {
    if (ruta in colecciones) return { coleccion: ruta, id: null };
    const corte = ruta.lastIndexOf("/");
    if (corte > 0 && ruta.slice(0, corte) in colecciones) {
        return { coleccion: ruta.slice(0, corte), id: decodeURIComponent(ruta.slice(corte + 1)) };
    }
    return null;
};

const casa = (f: RespuestaFija, metodo: string, ruta: string): boolean =>
    f.metodo.toUpperCase() === metodo && (typeof f.ruta === "string" ? f.ruta === ruta : f.ruta.test(ruta));

export const crearApiDemo = (datos: Colecciones, fijas: RespuestaFija[] = []) => {
    // Copia: los cambios de una demo no tocan los datos de partida.
    const colecciones: Colecciones = Object.fromEntries(
        Object.entries(datos).map(([k, v]) => [k, v.map((r) => ({ ...r }))]));
    let siguiente = 1;

    const responder = (metodo: string, url: string, cuerpo: unknown, base = ""): RespuestaDemo => {
        const ruta = rutaDeUrl(url, base);
        const m = metodo.toUpperCase();
        const fija = fijas.find((f) => casa(f, m, ruta));
        if (fija) {
            const peticion: PeticionDemo = {
                url, ruta, tramos: ruta.split("/"), cuerpo, colecciones, nuevoId: () => `demo-${siguiente++}`,
            };
            const c = typeof fija.cuerpo === "function" ? fija.cuerpo(peticion) : fija.cuerpo;
            return { estado: 200, cuerpo: c };
        }
        const destino = resolver(colecciones, ruta);

        if (!destino) {
            // Desconocido: lista vacía en lecturas y «hecho» en escrituras.
            return m === "GET"
                ? { estado: 200, cuerpo: VACIA, sinDatos: true }
                : { estado: 200, cuerpo: { id: `demo-${siguiente++}` }, sinDatos: true };
        }
        const lista = colecciones[destino.coleccion];

        if (m === "GET" && destino.id === null) {
            const { orden, paginacion } = criteriaDeUrl(url);
            const ordenados = ordenar(lista, orden);
            return { estado: 200, cuerpo: { datos: paginar(ordenados, paginacion), total: ordenados.length } };
        }
        if (m === "GET") {
            const registro = lista.find((r) => r.id === destino.id);
            return registro ? { estado: 200, cuerpo: { datos: registro } } : { estado: 404, cuerpo: "No existe en la demo" };
        }
        if (m === "POST" && destino.id === null) {
            const id = `demo-${siguiente++}`;
            lista.unshift({ ...(cuerpo as Record<string, unknown> ?? {}), id });
            return { estado: 200, cuerpo: { id } };
        }
        if ((m === "PATCH" || m === "PUT") && destino.id !== null) {
            const i = lista.findIndex((r) => r.id === destino.id);
            if (i < 0) return { estado: 404, cuerpo: "No existe en la demo" };
            lista[i] = { ...lista[i], ...(cuerpo as Record<string, unknown> ?? {}), id: lista[i].id };
            return { estado: 200, cuerpo: {} };
        }
        if (m === "DELETE" && destino.id !== null) {
            const i = lista.findIndex((r) => r.id === destino.id);
            if (i >= 0) lista.splice(i, 1);
            return { estado: 200, cuerpo: {} };
        }
        // Acciones sobre un registro (POST /x/1/cerrar…): se dan por hechas.
        return { estado: 200, cuerpo: {} };
    };

    return { responder, colecciones };
};
