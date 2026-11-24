import { fechaApi, sinTexto } from "../comun/dominio.ts";
import { GeneracionCalendario } from "./diseño.ts";

/** Tope de días que el servidor genera de una vez (5 años). */
export const MAXIMO_DIAS_GENERAR = 366 * 5;

const diaUtc = (fecha: string): number => {
    const [a, m, d] = fecha.split("-").map(Number);
    return Date.UTC(a, m - 1, d) / 86400000;
};

/** Días de `desde` a `hasta`, ambos incluidos. */
export const diasEntre = (desde: string, hasta: string): number => diaUtc(hasta) - diaUtc(desde) + 1;

/** Del primer al último día del mes de `hoy`, para la lista inicial. */
export const rangoMes = (hoy: Date): { desde: string; hasta: string } => ({
    desde: fechaApi(new Date(hoy.getFullYear(), hoy.getMonth(), 1)),
    hasta: fechaApi(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)),
});

/** Motivo por el que el rango de la lista no vale, o `null`. */
export const motivoRangoNoValido = (desde: string, hasta: string): string | null => {
    if (sinTexto(desde) || sinTexto(hasta)) return "Indique las fechas desde y hasta";
    if (hasta < desde) return "La fecha hasta es anterior a la fecha desde";
    return null;
};

/** Las validaciones de la generación (las mismas que el servidor). `hoy` en "AAAA-MM-DD". */
export const motivoGeneracionNoValida = (g: GeneracionCalendario, hoy: string): string | null => {
    const rango = motivoRangoNoValido(g.desde, g.hasta);
    if (rango) return rango;
    if (g.desde < hoy) return "La fecha desde no puede ser anterior a hoy";
    if (diasEntre(g.desde, g.hasta) > MAXIMO_DIAS_GENERAR)
        return `No se pueden generar más de ${MAXIMO_DIAS_GENERAR} días de una vez`;
    if (sinTexto(g.horarioLaboralId)) return "Falta el horario de los días laborables";
    return null;
};

/** Generación por defecto: de hoy a final de año con el horario laboral sin elegir. */
export const generacionVacia = (hoy: Date): GeneracionCalendario => ({
    desde: fechaApi(hoy),
    hasta: fechaApi(new Date(hoy.getFullYear(), 11, 31)),
    horarioLaboralId: "",
    horarioSabadoId: "",
    horarioDomingoId: "",
});
