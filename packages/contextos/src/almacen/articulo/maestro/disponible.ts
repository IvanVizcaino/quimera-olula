import { MetaTabla } from "@olula/componentes/index.js";
import { Entidad } from "@olula/lib/diseño.ts";

type ConDisponible = Entidad & { totalDisponible?: number | null };

/** Columna `Disponible` (Eneboo `articulos.totaldisponible`), solo con plugin `disponible_art`. */
export const columnaDisponible = {
  id: "totalDisponible",
  cabecera: "Disponible",
  render: (a: ConDisponible) =>
    a.totalDisponible === undefined || a.totalDisponible === null
      ? ""
      : String(a.totalDisponible),
};

export const metaTablaConDisponible = <A extends ConDisponible>(
  meta: MetaTabla<A>,
  conDisponible: boolean
): MetaTabla<A> =>
  conDisponible && !meta.some((c) => c.id === columnaDisponible.id)
    ? [...meta, columnaDisponible as MetaTabla<A>[number]]
    : meta;
