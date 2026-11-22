import { RestAPI } from "@olula/lib/api/rest_api.ts";
import FISCAL_Urls from "./urls.ts";

const urls = new FISCAL_Urls();

export type Elemento = { id: string; descripcion: string };
export type OpcionSii = { valor: string; descripcion: string };

/** Catálogos del SII (tablas del módulo SII del escritorio). */
export const CATALOGOS_SII = {
    clavesEmitidas: urls.SII_CLAVE_OPERACION_EMITIDAS,
    clavesRecibidas: urls.SII_CLAVE_OPERACION_RECIBIDAS,
    tiposOperacion: urls.SII_TIPO_OPERACION,
};

// Son listas cortas y fijas: se piden una vez y se filtran aquí.
const cache = new Map<string, Promise<Elemento[]>>();

export const leer = (url: string): Promise<Elemento[]> => {
    if (!cache.has(url)) {
        cache.set(url, RestAPI.get<{ datos: Elemento[] }>(url)
            .then((r) => r.datos)
            .catch((e) => { cache.delete(url); throw e; }));
    }
    return cache.get(url)!;
};

// En sii_tiposoperacion la descripción ya empieza por el código («S1 - Sujeta…»).
export const opcion = ({ id, descripcion }: Elemento): OpcionSii => ({
    valor: id,
    descripcion: !descripcion ? id : descripcion.startsWith(id) ? descripcion : `${id} — ${descripcion}`,
});

/** Filtra por código o descripción, sin distinguir mayúsculas ni tildes. */
export const filtrarCatalogo = (elementos: Elemento[], texto: string): Elemento[] => {
    const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const buscado = normalizar(texto.trim());
    return buscado
        ? elementos.filter((e) => normalizar(`${e.id} ${e.descripcion}`).includes(buscado))
        : elementos;
};
