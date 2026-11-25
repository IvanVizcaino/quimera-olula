import { moduloBloqueadoEnUrl, plugin } from "./dominio.ts";

export interface ElementoMenuBase {
    nombre: string;
    icono?: string;
    regla?: string | string[];
    /** Plugins que pide la entrada (todos). Un nombre suelto exige el estado
     *  "activo"; un objeto { nombre: estados } exige que el plugin esté en
     *  alguno de esos estados (p.ej. { estado_expedicion_factura: ["firma", "emision"] }). */
    plugin?: string | string[] | Record<string, string | string[]>;
    color?: string;
    variant?: string;
    posicion?: number;
}

export interface ElementoMenuPadre extends ElementoMenuBase {
    subelementos: ElementoMenuHijo[];
    /** Título visual bajo el que se agrupa en el menú (Comercial, Operaciones…).
     *  No es un nivel: solo ordena y rotula los grupos. */
    area?: string;
}

export interface ElementoMenuHijo extends ElementoMenuBase {
    url: string;
    descripcionIA?: string;
    parametrosIA?: Record<string, string>;
    /** Otras palabras con las que se busca la pantalla (búsqueda rápida). */
    alias?: string[];
}

export type ElementoMenu = ElementoMenuPadre | ElementoMenuHijo;

export type MenuContextFactory = { menu: ElementoMenu };


// Como Object.groupBy (mismo orden de claves), que no existe hasta Node 21 ni en
// Safari < 17.4.
const agrupar = <T,>(lista: T[], clave: (item: T) => string): Record<string, T[]> =>
    lista.reduce<Record<string, T[]>>((grupos, item) => {
        (grupos[clave(item)] ??= []).push(item);
        return grupos;
    }, {});

export const crearMenu = (factory: Record<string, MenuContextFactory>) => {
    const formatearNombre = (i: ElementoMenu) => ({ ...i, nombre: i.nombre.split('/').pop()?.trim() });
    const agruparPorNombre = (i: ElementoMenu) => i.nombre.split('/')[0];

    const factorias = Object.values(factory);
    const menus = factorias.map(v => (v as MenuContextFactory)?.menu).filter(Boolean).flat();
    const items = menus.map(m => Object.entries(m).map(([k, v]) => ({ nombre: k, ...v }))).flat();
    const itemsAgrupados = Object.entries(agrupar(items, agruparPorNombre)).map(([k, v]) => ({ ...((v ?? []).filter(i => i.nombre === k)[0]), subelementos: (v ?? []).filter(i => i.nombre !== k).map(formatearNombre) }));

    itemsAgrupados.sort((a, b) => (a.posicion ?? Infinity) - (b.posicion ?? Infinity));

    return (itemsAgrupados as ElementoMenu[]).map(conReglaEnResumen);
};
const esResumen = (e: ElementoMenuBase) => !!(e as Partial<ElementoMenuHijo>).url?.startsWith("/dashboard/");

/**
 * El «Resumen» (dashboard) de un módulo no tiene regla propia: se ve si se puede
 * alguna de las demás opciones del módulo. Sin esto, un grupo que sólo tiene
 * permitido Ventas seguía viendo Almacén, Compras, CRM o Tesorería con su Resumen.
 */
export const conReglaEnResumen = (elemento: ElementoMenu): ElementoMenu => {
    if (!("subelementos" in elemento) || !elemento.subelementos?.length) return elemento;
    const reglasModulo = [...new Set(elemento.subelementos
        .filter((e) => !esResumen(e))
        .flatMap((e) => (e.regla === undefined ? [] : [e.regla].flat())))];
    if (!reglasModulo.length) return elemento;
    return {
        ...elemento,
        subelementos: elemento.subelementos.map((e) =>
            esResumen(e) && e.regla === undefined ? { ...e, regla: reglasModulo } : e),
    };
};

/** Los plugins que pide la entrada están activos en esta instalación (whoami). */
export const pluginsActivos = (e: ElementoMenuBase): boolean => {
    if (!e.plugin) return true;
    if (typeof e.plugin === "string" || Array.isArray(e.plugin))
        return [e.plugin].flat().every((nombre) => plugin(nombre) === "activo");
    return Object.entries(e.plugin).every(([nombre, estados]) =>
        [estados].flat().includes(plugin(nombre))
    );
};

/** SaaS: la entrada no es de un módulo que la empresa no tiene contratado. */
export const disponibleEnSaas = (e: ElementoMenuBase): boolean =>
    !("url" in e) || typeof e.url !== "string" || !moduloBloqueadoEnUrl(e.url);
