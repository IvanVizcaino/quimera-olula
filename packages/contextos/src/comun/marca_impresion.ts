import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { Entidad } from "@olula/lib/diseño.ts";
import { pluginActivo } from "@olula/lib/plugins.tsx";

type ConImpreso = Entidad & { impreso?: boolean };

/** Columna listado cuando el plugin `marca_impresion` está activo. */
export const metaColumnaImpreso = <T extends ConImpreso>(): MetaTabla<T>[number] => ({
    id: "impreso",
    cabecera: "Impreso",
    prioridad: "baja",
    render: (e) => (e.impreso ? "Sí" : "No"),
});

export const conColumnaImpreso = <T extends ConImpreso>(meta: MetaTabla<T>): MetaTabla<T> =>
    pluginActivo("marca_impresion") ? [...meta, metaColumnaImpreso<T>()] : meta;
