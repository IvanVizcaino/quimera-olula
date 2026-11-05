import { ejercicioActual } from "#/contabilidad/asiento/dominio.ts";
import {
    filtroIvaVacio,
    presentacionIvaVacia,
} from "#/contabilidad/comun/librosIva.ts";
import {
    LibroFacturasEmitidas,
    NuevoLibroFacturasEmitidas,
} from "./diseño.ts";

export { ejercicioActual };

export const etiquetaLibroFacturasEmitidas = (
    informe: Pick<LibroFacturasEmitidas, "descripcion" | "ejercicioId">
): string =>
    informe.descripcion
        ? `${informe.descripcion} — ${informe.ejercicioId}`
        : `Facturas emitidas ${informe.ejercicioId}`;

export const libroFacturasEmitidasVacio = (): LibroFacturasEmitidas => ({
    id: "",
    descripcion: "",
    ejercicioId: "",
    fechaDesde: "",
    fechaHasta: "",
    ...filtroIvaVacio(),
    ...presentacionIvaVacia(),
});

/** El combo de porcentaje solo se habilita al desmarcar «todos los tipos»,
 * como en el formulario de Eneboo. */
export const admitePorcentaje = (
    informe: Pick<LibroFacturasEmitidas, "todos">
): boolean => !informe.todos;

/** El número inicial solo cuenta con la numeración automática encendida. */
export const admiteNumeroDesde = (
    informe: Pick<LibroFacturasEmitidas, "numeracionAutomatica">
): boolean => informe.numeracionAutomatica;

export const nuevoLibroFacturasEmitidasInicial = (
    ejercicioId: string
): NuevoLibroFacturasEmitidas => ({
    descripcion: "",
    ejercicioId,
    fechaDesde: `${ejercicioId}-01-01`,
    fechaHasta: `${ejercicioId}-12-31`,
    ...filtroIvaVacio(),
    ...presentacionIvaVacia(),
});

export const nombreFicheroLibroFacturasEmitidas = (
    informe: Pick<LibroFacturasEmitidas, "descripcion" | "ejercicioId">
): string => {
    const base = (
        informe.descripcion || `facturas emitidas ${informe.ejercicioId}`
    )
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    return `${base || "libro-facturas-emitidas"}.pdf`;
};
