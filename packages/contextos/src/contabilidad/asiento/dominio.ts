import { ClausulaFiltro, Criteria } from "@olula/lib/diseño.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import {
    Asiento,
    ItemAsiento,
    NuevoAsientoManual,
    PartidaAsiento,
    PartidaManualInput,
} from "./diseño.ts";

export const metaPartidaManual: MetaModelo<PartidaManualInput> = {
    campos: {
        subcuentaId: { requerido: true },
        debe: { requerido: true },
        haber: { requerido: true },
        concepto: { requerido: false },
    },
};

export const metaNuevoAsientoManual: MetaModelo<NuevoAsientoManual> = {
    campos: {
        ejercicioId: { requerido: true },
        fecha: { requerido: true },
        concepto: { requerido: true, minimo: 1 },
        partidas: { requerido: true, minimo: 2 },
    },
};

export const partidaManualVacia = (): PartidaManualInput => ({
    subcuentaId: 0,
    debe: 0,
    haber: 0,
    concepto: "",
});

export const nuevoAsientoManualVacio = (ejercicioId: string): NuevoAsientoManual => ({
    ejercicioId,
    fecha: new Date(),
    concepto: "",
    partidas: [partidaManualVacia(), partidaManualVacia()],
});

export const asientoVacio = (): Asiento => ({
    id: "",
    numero: 0,
    ejercicioId: "",
    fecha: new Date(),
    concepto: "",
    importe: 0,
    manual: false,
    partidas: [],
});

export const totalDebe = (partidas: Pick<PartidaAsiento | PartidaManualInput, "debe">[]): number =>
    partidas.reduce((acc, p) => acc + (p.debe || 0), 0);

export const totalHaber = (partidas: Pick<PartidaAsiento | PartidaManualInput, "haber">[]): number =>
    partidas.reduce((acc, p) => acc + (p.haber || 0), 0);

export const descuadrePartidas = (
    partidas: Pick<PartidaAsiento | PartidaManualInput, "debe" | "haber">[]
): number => totalDebe(partidas) - totalHaber(partidas);

export const asientoCuadrado = (
    partidas: Pick<PartidaAsiento | PartidaManualInput, "debe" | "haber">[]
): boolean => Math.abs(descuadrePartidas(partidas)) < 0.005;

export const etiquetaAsiento = (a: ItemAsiento | Asiento): string =>
    `${a.ejercicioId} · nº ${a.numero} · ${a.fecha.toLocaleDateString("es-ES")}`;

export const ejercicioActual = (): string => String(new Date().getFullYear());

const clausulasFiltro = (filtro: Criteria["filtro"]): ClausulaFiltro[] => {
    if (Array.isArray(filtro) && filtro.length > 0 && Array.isArray(filtro[0])) {
        return filtro as ClausulaFiltro[];
    }
    if (Array.isArray(filtro) && typeof filtro[0] === "string") {
        return [filtro as ClausulaFiltro];
    }
    return [];
};

/** Ejercicio del filtro activo del listado (`ejercicio_id:eq:`). */
export const ejercicioIdEnCriteria = (criteria: Criteria): string | undefined => {
    for (const clausula of clausulasFiltro(criteria.filtro)) {
        if (clausula[0] === "ejercicio_id" && clausula[1] === "eq" && clausula[2] !== undefined) {
            return String(clausula[2]);
        }
    }
    return undefined;
};

export const ejercicioIdParaRenumerar = (criteria: Criteria): string =>
    ejercicioIdEnCriteria(criteria) ?? ejercicioActual();

export const mensajeConfirmacionRenumerarAsientos = (ejercicioId: string): string =>
    `Se va a proceder a renumerar todos los asientos del diario correspondientes al ejercicio:\n\n${ejercicioId}\n\nPuede tardar varios minutos si hay miles de asientos.\n\n¿Desea continuar?`;
