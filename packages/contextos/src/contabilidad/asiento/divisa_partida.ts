import { PartidaManualInput } from "./diseño.ts";

/** Divisa con su tasa de conversión (tabla divisas). */
export type DivisaConTasa = { id: string; descripcion: string; tasa: number };

const aCentimos = (n: number): number => Math.round(n * 100) / 100;

/** Divisa de la partida: la suya o, si no tiene, la de la empresa. */
export const divisaDePartida = (p: PartidaManualInput, divisaEmpresa: string): string =>
    p.divisaId || divisaEmpresa;

export const esDivisaExtranjera = (p: PartidaManualInput, divisaEmpresa: string): boolean =>
    !!divisaEmpresa && divisaDePartida(p, divisaEmpresa) !== divisaEmpresa;

export const tasaDeDivisa = (divisas: DivisaConTasa[], id: string): number =>
    divisas.find((d) => d.id === id)?.tasa || 1;

/** Debe y haber a partir de los importes en moneda extranjera y la tasa
 * (calculateField «debe» / «haber»). */
const recalcular = (p: PartidaManualInput): PartidaManualInput => {
    const tasa = p.tasaConversion ?? 1;
    return { ...p, debe: aCentimos((p.debeMe ?? 0) * tasa), haber: aCentimos((p.haberMe ?? 0) * tasa) };
};

/** Cambio de divisa (bChanged «coddivisa»): importes a cero (valoresAcero) y la
 * tasa de la tabla divisas; en la de la empresa, tasa 1 y sin importes ME. */
export const cambiarDivisa = (
    p: PartidaManualInput,
    divisa: string,
    divisaEmpresa: string,
    divisas: DivisaConTasa[],
): PartidaManualInput => {
    const extranjera = divisa !== divisaEmpresa;
    return {
        ...p,
        divisaId: divisa,
        tasaConversion: extranjera ? tasaDeDivisa(divisas, divisa) : 1,
        debe: 0,
        haber: 0,
        debeMe: 0,
        haberMe: 0,
    };
};

/** Partida sin nada informado: ni subcuenta, ni importes, ni concepto. */
export const partidaVacia = (p: PartidaManualInput): boolean =>
    !p.subcuentaId && !p.debe && !p.haber && !p.debeMe && !p.haberMe && !p.concepto?.trim();

/** Cambia la divisa de la partida `indice` y, con ella, la de las partidas
 * siguientes que sigan vacías (p. ej. la segunda de las dos que trae el alta). */
export const cambiarDivisaEnPartidas = (
    partidas: PartidaManualInput[],
    indice: number,
    divisa: string,
    divisaEmpresa: string,
    divisas: DivisaConTasa[],
): PartidaManualInput[] =>
    partidas.map((p, i) =>
        i === indice || (i > indice && partidaVacia(p))
            ? cambiarDivisa(p, divisa, divisaEmpresa, divisas)
            : p
    );

/** Debe en moneda extranjera: con importe, el haber se pone a cero. */
export const cambiarDebeMe = (p: PartidaManualInput, valor: number): PartidaManualInput =>
    recalcular({ ...p, debeMe: valor, ...(valor !== 0 ? { haberMe: 0 } : {}) });

/** Haber en moneda extranjera: con importe, el debe se pone a cero. */
export const cambiarHaberMe = (p: PartidaManualInput, valor: number): PartidaManualInput =>
    recalcular({ ...p, haberMe: valor, ...(valor !== 0 ? { debeMe: 0 } : {}) });

/** Cambio de tasa: se recalculan debe y haber. */
export const cambiarTasa = (p: PartidaManualInput, tasa: number): PartidaManualInput =>
    recalcular({ ...p, tasaConversion: tasa });

/** Una partida nueva lleva la divisa (y su tasa) de la última partida en la que
 * se eligió divisa: tras cambiarla en una, las siguientes siguen en ella. */
export const divisaParaNuevaPartida = (
    partidas: PartidaManualInput[],
): Pick<PartidaManualInput, "divisaId" | "tasaConversion"> => {
    const ultima = [...partidas].reverse().find((p) => p.divisaId);
    return ultima?.divisaId
        ? { divisaId: ultima.divisaId, tasaConversion: ultima.tasaConversion ?? 1 }
        : {};
};

/** Texto de un importe a número: admite coma o punto decimal; vacío es 0 y lo
 * que aún no es un número completo («-», «,») da null. */
export const textoAImporte = (texto: string): number | null => {
    const limpio = texto.trim().replace(/\s/g, "");
    if (limpio === "") return 0;
    const normalizado = limpio.includes(",") ? limpio.replace(/\./g, "").replace(",", ".") : limpio;
    if (!/^-?\d*\.?\d*$/.test(normalizado) || normalizado === "-" || normalizado === ".") return null;
    const n = Number(normalizado);
    return Number.isFinite(n) ? n : null;
};
