/**
 * Lo que el SGA recuerda en este navegador (doc sga_ergonomia.md, punto 3): el almacén de trabajo,
 * los parámetros del ABC y las preferencias de cada pantalla. Todo con `localStorage` tolerante a
 * fallos: si no se puede leer o escribir, los valores por defecto.
 */
import { ClausulaFiltro, Criteria } from "@olula/lib/diseño.ts";
import { DIAS_POR_DEFECTO, ORIGEN_POR_DEFECTO, origenRotacion } from "#/almacen/slotting/dominio.ts";
import { OrigenRotacion } from "#/almacen/slotting/diseño.ts";

const leer = <T>(clave: string): T | null => {
    try {
        const crudo = localStorage.getItem(clave);
        return crudo ? (JSON.parse(crudo) as T) : null;
    } catch {
        return null;
    }
};

const guardar = (clave: string, valor: unknown): void => {
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
    } catch {
        // Sin almacenamiento (modo privado, bloqueado): no se recuerda.
    }
};

/** La misma clave que el «almacén local» que fija la ficha del almacén. */
const CLAVE_ALMACEN = "almacen-local";

export const almacenDeTrabajo = {
    obtener: (): string | null => leer<{ id?: string }>(CLAVE_ALMACEN)?.id || null,
    fijar: (id: string | null | undefined, nombre?: string): void => {
        if (!id) return;
        const actual = leer<{ id?: string; nombre_almacen?: string }>(CLAVE_ALMACEN);
        if (actual?.id === id && !nombre) return;
        guardar(CLAVE_ALMACEN, { id, nombre_almacen: nombre ?? (actual?.id === id ? actual.nombre_almacen : id) });
    },
};

export interface ParametrosAbc {
    origen: OrigenRotacion;
    dias: string;
}

const CLAVE_ABC = "sga-parametros-abc";

/** «Rotación según» y «Días»: los mismos en el mapa y en el slotting. */
export const parametrosAbc = {
    obtener: (): ParametrosAbc => {
        const guardados = leer<Partial<ParametrosAbc>>(CLAVE_ABC);
        return {
            origen: origenRotacion(guardados?.origen ?? ORIGEN_POR_DEFECTO),
            dias: guardados?.dias || String(DIAS_POR_DEFECTO),
        };
    },
    guardar: (cambios: Partial<ParametrosAbc>): void =>
        guardar(CLAVE_ABC, { ...parametrosAbc.obtener(), ...cambios }),
};

/** Preferencias de una pantalla (`sga-<pantalla>`), fusionadas con sus valores por defecto. */
export const preferenciasPantalla = <T extends object>(pantalla: string, defecto: T) => ({
    obtener: (): T => ({ ...defecto, ...(leer<Partial<T>>(`sga-${pantalla}`) ?? {}) }),
    guardar: (cambios: Partial<T>): void =>
        guardar(`sga-${pantalla}`, { ...defecto, ...(leer<Partial<T>>(`sga-${pantalla}`) ?? {}), ...cambios }),
});

/** Un parámetro de la URL actual (los enlaces a las pantallas de proceso). */
export const parametroUrl = (nombre: string): string | null => {
    try {
        return new URLSearchParams(window.location.search).get(nombre) || null;
    } catch {
        return null;
    }
};

const clausulas = (criteria: Criteria): ClausulaFiltro[] => {
    const { filtro } = criteria;
    if (!Array.isArray(filtro) || filtro.length === 0) return [];
    return Array.isArray(filtro[0]) ? (filtro as ClausulaFiltro[]) : [filtro as ClausulaFiltro];
};

/**
 * Criterios con los que entra un listado del SGA: los de la URL si trae filtros (un enlace, tal
 * cual); si no, los de por defecto del listado más el almacén de trabajo (visible en el panel de
 * filtros, se quita como cualquier otro).
 */
export const criteriaInicialSga = (
    deUrl: Criteria, porDefecto: Criteria, campo = "almacen_id",
): Criteria => {
    if (clausulas(deUrl).length > 0) return deUrl;
    const almacen = almacenDeTrabajo.obtener();
    const base = clausulas(porDefecto);
    if (!almacen || base.some((c) => c[0] === campo)) return porDefecto;
    return { ...porDefecto, filtro: [...base, [campo, "=", almacen]] };
};
