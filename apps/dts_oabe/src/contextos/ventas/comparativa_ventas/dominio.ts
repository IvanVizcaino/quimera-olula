import { MetaModelo } from "@olula/lib/dominio.ts";
import {
    AGENTE_CLIENTE,
    AGENTE_FACTURA,
    ComparativaVentas,
    NuevaComparativaVentas,
} from "./diseño.ts";

export const opcionesBusquedaAgente = [
    { valor: AGENTE_FACTURA, descripcion: AGENTE_FACTURA },
    { valor: AGENTE_CLIENTE, descripcion: AGENTE_CLIENTE },
];

export const etiquetaComparativaVentas = (
    comparativa: Pick<ComparativaVentas, "descripcion" | "anioDesde" | "anioHasta">
): string =>
    `${comparativa.descripcion} — ${comparativa.anioDesde}-${comparativa.anioHasta}`;

const camposComunes = (anioHasta: number) => ({
    descripcion: "",
    anioDesde: anioHasta - 2,
    anioHasta,
    fechaDesde: "",
    fechaHasta: "",
    clienteId: "",
    nombreCliente: "",
    agenteId: "",
    nombreAgente: "",
    busquedaAgente: AGENTE_FACTURA,
    provinciaId: "",
    mostrarObjetivo: false,
});

export const comparativaVentasVacia = (): ComparativaVentas => ({
    id: "",
    ...camposComunes(new Date().getFullYear()),
});

export const nuevaComparativaVentasInicial = (): NuevaComparativaVentas =>
    camposComunes(new Date().getFullYear());

export const admiteFechas = (
    comparativa: Pick<ComparativaVentas, "mostrarObjetivo">
): boolean => !comparativa.mostrarObjetivo;

const esAnio = (valor: unknown): boolean => /^\d{4}$/.test(String(valor ?? ""));

export const enlazarAnios = <T extends NuevaComparativaVentas>(
    modelo: T,
    campo: string
): T => {
    if (campo === "anioDesde" && esAnio(modelo.anioDesde)) {
        return { ...modelo, anioDesde: Number(modelo.anioDesde), anioHasta: Number(modelo.anioDesde) + 2 };
    }
    if (campo === "anioHasta" && esAnio(modelo.anioHasta)) {
        return { ...modelo, anioHasta: Number(modelo.anioHasta), anioDesde: Number(modelo.anioHasta) - 2 };
    }
    if (campo === "mostrarObjetivo" && modelo.mostrarObjetivo) {
        return { ...modelo, fechaDesde: "", fechaHasta: "" };
    }
    return modelo;
};

const validarComparativa = (modelo: NuevaComparativaVentas): string | boolean => {
    if (!esAnio(modelo.anioDesde) || !esAnio(modelo.anioHasta)) {
        return "Los años deben tener 4 cifras";
    }
    if (Number(modelo.anioHasta) !== Number(modelo.anioDesde) + 2) {
        return "El año hasta debe ser el año desde más 2";
    }
    if (modelo.fechaDesde && modelo.fechaHasta && modelo.fechaDesde > modelo.fechaHasta) {
        return "La fecha desde no puede ser posterior a la fecha hasta";
    }
    return true;
};

export const metaComparativaVentas = <T extends NuevaComparativaVentas>(): MetaModelo<T> => ({
    campos: {
        descripcion: { requerido: true },
        anioDesde: { requerido: true, tipo: "entero" },
        anioHasta: { requerido: true, tipo: "entero" },
        fechaDesde: { tipo: "fecha" },
        fechaHasta: { tipo: "fecha" },
        mostrarObjetivo: { tipo: "checkbox" },
    },
    editable: (modelo, campo) =>
        !(campo === "fechaDesde" || campo === "fechaHasta") || admiteFechas(modelo),
    validacion: validarComparativa,
    onChange: enlazarAnios,
});

export const nombreFicheroComparativaVentas = (
    comparativa: Pick<ComparativaVentas, "descripcion">
): string => {
    const base = (comparativa.descripcion || "comparativa ventas")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    return `${base || "comparativa-ventas"}.pdf`;
};
