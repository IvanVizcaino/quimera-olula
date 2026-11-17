import { ClausulaFiltro, Criteria, Orden } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";

/** Documentos de un cliente o proveedor: los más recientes primero y, a igual
 * fecha, el código mayor primero. */
export const ordenDocumentos = (campoFecha = "fecha"): Orden => [campoFecha, "DESC", "codigo", "DESC"];

export const criteriaDocumentos = (filtro: ClausulaFiltro[], orden: Orden): Criteria => ({
    ...criteriaDefecto,
    filtro,
    orden,
});

/** Qué hacer con la lista cuando la ficha abierta publica un evento. */
export type EfectoEvento = "recargar" | "recargar_y_cerrar" | "cerrar" | null;

export const efectoEvento = (evento: string): EfectoEvento => {
    if (/_borrad[oa]$/.test(evento)) return "recargar_y_cerrar";
    if (/_deseleccionad[oa]$/.test(evento)) return "cerrar";
    if (/_(cambiad[oa]|desagrupado)$/.test(evento)) return "recargar";
    return null;
};
