import { ejercicioActual } from "#/contabilidad/asiento/dominio.ts";
import {
    filtroIvaVacio,
    presentacionIvaVacia,
} from "#/contabilidad/comun/librosIva.ts";
import {
    LibroFacturasRecibidas,
    NuevoLibroFacturasRecibidas,
} from "./diseño.ts";

export { ejercicioActual };

export const etiquetaLibroFacturasRecibidas = (
    informe: Pick<LibroFacturasRecibidas, "descripcion" | "ejercicioId">
): string =>
    informe.descripcion
        ? `${informe.descripcion} — ${informe.ejercicioId}`
        : `Facturas recibidas ${informe.ejercicioId}`;

export const libroFacturasRecibidasVacio = (): LibroFacturasRecibidas => ({
    id: "",
    descripcion: "",
    ejercicioId: "",
    fechaDesde: "",
    fechaHasta: "",
    codigoSerie: "",
    ...filtroIvaVacio(),
    ...presentacionIvaVacia(),
});

/** El combo de porcentaje solo se habilita al desmarcar «todos los tipos»,
 * como en el formulario de Eneboo. */
export const admitePorcentaje = (
    informe: Pick<LibroFacturasRecibidas, "todos">
): boolean => !informe.todos;

/** El número inicial solo cuenta con la numeración automática encendida. */
export const admiteNumeroDesde = (
    informe: Pick<LibroFacturasRecibidas, "numeracionAutomatica">
): boolean => informe.numeracionAutomatica;

export const nuevoLibroFacturasRecibidasInicial = (
    ejercicioId: string
): NuevoLibroFacturasRecibidas => ({
    descripcion: "",
    ejercicioId,
    fechaDesde: `${ejercicioId}-01-01`,
    fechaHasta: `${ejercicioId}-12-31`,
    codigoSerie: "",
    ...filtroIvaVacio(),
    ...presentacionIvaVacia(),
});

export const nombreFicheroLibroFacturasRecibidas = (
    informe: Pick<LibroFacturasRecibidas, "descripcion" | "ejercicioId">
): string => {
    const base = (
        informe.descripcion || `facturas recibidas ${informe.ejercicioId}`
    )
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    return `${base || "libro-facturas-recibidas"}.pdf`;
};
