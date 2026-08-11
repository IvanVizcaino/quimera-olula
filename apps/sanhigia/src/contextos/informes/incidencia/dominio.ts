import { rangoDesdeAtajo } from "@olula/lib/infraestructura.ts";
import { FiltroInformeIncidencias } from "./diseño.ts";

export const filtroInformeIncidenciasVacio: FiltroInformeIncidencias = {
    agenteId: "",
    fechaDesde: "",
    fechaHasta: "",
};

const aFechaHoraLocal = (fecha: Date, horas: number, minutos: number): string => {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, "0");
    const d = String(fecha.getDate()).padStart(2, "0");
    const hh = String(horas).padStart(2, "0");
    const mm = String(minutos).padStart(2, "0");
    return `${y}-${m}-${d}T${hh}:${mm}`;
};

export const rangoFechaHoraDesdeAtajo = (atajo: string): { fechaDesde: string; fechaHasta: string } | null => {
    const calcularRango = rangoDesdeAtajo[atajo];
    if (!calcularRango) return null;

    const [desde, hasta] = calcularRango();
    return {
        fechaDesde: aFechaHoraLocal(desde, 0, 0),
        fechaHasta: aFechaHoraLocal(hasta, 23, 59),
    };
};

export const extensionDesdeTipoMime = (tipo: string): string => {
    if (tipo.includes("spreadsheetml")) return "xlsx";
    if (tipo.includes("opendocument")) return "odt";
    if (tipo.includes("csv")) return "csv";
    return "xlsx";
};

const soloFecha = (fechaHora: string): string => fechaHora.split("T")[0];

const normalizarParaFichero = (texto: string): string =>
    texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

export type FiltroNombreFicheroInformeIncidencias = Omit<FiltroInformeIncidencias, "agenteId"> & {
    agenteNombre: string;
};

export const nombreFicheroInformeIncidencias = (
    filtro: FiltroNombreFicheroInformeIncidencias,
    extension: string
): string => {
    const partes: string[] = ["informe_incidencias"];

    if (filtro.agenteNombre) partes.push(`agente-${normalizarParaFichero(filtro.agenteNombre)}`);

    if (filtro.fechaDesde && filtro.fechaHasta) {
        partes.push(soloFecha(filtro.fechaDesde), soloFecha(filtro.fechaHasta));
    } else if (filtro.fechaDesde) {
        partes.push(soloFecha(filtro.fechaDesde));
    } else if (filtro.fechaHasta) {
        partes.push(soloFecha(filtro.fechaHasta));
    }

    return `${partes.join("_")}.${extension}`;
};
