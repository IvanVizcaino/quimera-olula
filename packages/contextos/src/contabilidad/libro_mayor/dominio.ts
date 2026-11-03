import { ejercicioActual } from "#/contabilidad/asiento/dominio.ts";
import { ASCENDENTE } from "#/contabilidad/libro_diario/dominio.ts";
import { LibroMayor, NuevoLibroMayor } from "./diseño.ts";

export { ASCENDENTE, ejercicioActual };

export const etiquetaLibroMayor = (
    informe: Pick<LibroMayor, "descripcion" | "ejercicioId">
): string =>
    informe.descripcion
        ? `${informe.descripcion} — ${informe.ejercicioId}`
        : `Libro mayor ${informe.ejercicioId}`;

export const libroMayorVacio = (): LibroMayor => ({
    id: "",
    descripcion: "",
    ejercicioId: "",
    fechaDesde: "",
    fechaHasta: "",
    todasSubcuentas: true,
    subcuentaDesde: "",
    subcuentaHasta: "",
    saldoInicial: true,
    excluirPartidasCero: false,
    orden: "Fecha",
    tipoOrden: ASCENDENTE,
});

export const nuevoLibroMayorInicial = (
    ejercicioId: string
): NuevoLibroMayor => ({
    descripcion: "",
    ejercicioId,
    fechaDesde: `${ejercicioId}-01-01`,
    fechaHasta: `${ejercicioId}-12-31`,
    todasSubcuentas: true,
    subcuentaDesde: "",
    subcuentaHasta: "",
    saldoInicial: true,
    excluirPartidasCero: false,
    orden: "Fecha",
    tipoOrden: ASCENDENTE,
});

export const nombreFicheroLibroMayor = (
    informe: Pick<LibroMayor, "descripcion" | "ejercicioId">
): string => {
    const base = (informe.descripcion || `libro mayor ${informe.ejercicioId}`)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    return `${base || "libro-mayor"}.pdf`;
};
