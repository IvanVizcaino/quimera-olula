/**
 * Pestañas de la pantalla del Plan General Contable, en el orden en que se
 * muestran. La clave permite abrir la pantalla directamente en una pestaña
 * (p. ej. la ruta antigua `/contabilidad/codigo_balance`).
 */
export const pestanasPgc = [
    { clave: "subcuentas", titulo: "Subcuentas" },
    { clave: "cuentas", titulo: "Cuentas" },
    { clave: "cuentas_especiales", titulo: "Cuentas especiales" },
    { clave: "subgrupos", titulo: "Subgrupos" },
    { clave: "grupos", titulo: "Grupos" },
    { clave: "codigos_balance", titulo: "Codigos de balance 2008" },
] as const;

export type PestanaPgc = (typeof pestanasPgc)[number]["clave"];

/** Índice de la pestaña con esa clave; la primera si no se indica o no existe. */
export const indicePestanaPgc = (clave?: string): number =>
    Math.max(0, pestanasPgc.findIndex((p) => p.clave === clave));

export const tituloPestanaPgc = (clave: PestanaPgc): string =>
    pestanasPgc[indicePestanaPgc(clave)].titulo;
