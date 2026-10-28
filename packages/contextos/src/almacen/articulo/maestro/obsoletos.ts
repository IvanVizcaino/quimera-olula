import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { ClausulaFiltro, Criteria } from "@olula/lib/diseño.ts";

/** Filtro «Ocultar obsoletos» (Eneboo `masterarticulos.chkObsoletos`), solo con
 * el plugin `art_obsoletos`: marcado ⇒ `obsoleto = false`, desmarcado ⇒ sin
 * cláusula (se ven todos). */
export const filtroOcultarObsoletos = {
  id: "ocultar_obsoletos",
  campo: "obsoleto",
  label: "Ocultar obsoletos",
  tipo: "checkbox" as const,
  filtro: (v: unknown): ClausulaFiltro | null =>
    v === "true" || v === true ? ["obsoleto", "=", "false"] : null,
  fromFiltro: (filtro: ClausulaFiltro[]) =>
    filtro.some(
      ([campo, , valor]) => campo === "obsoleto" && valor === "false"
    )
      ? "true"
      : "",
};

export const metaFiltroConObsoletos = (
  meta: MetaFiltro,
  conObsoletos: boolean
): MetaFiltro =>
  conObsoletos && !meta[filtroOcultarObsoletos.id]
    ? { ...meta, [filtroOcultarObsoletos.id]: filtroOcultarObsoletos }
    : meta;

/** En Eneboo el checkbox nace marcado: el maestro oculta los obsoletos mientras
 * el usuario no los pida (R3). */
export const criteriaSinObsoletos = (
  criteria: Criteria,
  conObsoletos: boolean
): Criteria => {
  const clausulas = criteria.filtro as ClausulaFiltro[];

  return !conObsoletos || clausulas.some(([campo]) => campo === "obsoleto")
    ? criteria
    : {
        ...criteria,
        filtro: [
          ...clausulas,
          ["obsoleto", "=", "false"],
        ] as ClausulaFiltro[],
      };
};
