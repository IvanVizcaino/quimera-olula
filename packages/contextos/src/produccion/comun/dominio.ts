/** Utilidades compartidas por los maestros de producción. */
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";

/** Campo de texto vacío. `useModelo` deja en `null` el campo que se borra, aunque su tipo sea `string`. */
export const sinTexto = (s: string | null | undefined): boolean => !s || s.trim() === "";

/**
 * Motivo por el que un texto no es válido (vacío siendo obligatorio o más largo que la columna)
 * o `null` si lo es. Las longitudes son las del .mtd de Eneboo, como en el servidor.
 */
export const motivoTextoNoValido = (
    valor: string | null | undefined,
    etiqueta: string,
    longitudMaxima: number,
    obligatorio = true,
): string | null => {
    if (sinTexto(valor)) return obligatorio ? `${etiqueta} es obligatorio` : null;
    if ((valor ?? "").length > longitudMaxima)
        return `${etiqueta} admite como máximo ${longitudMaxima} caracteres`;
    return null;
};

/** El primer motivo de error o `true` si no hay ninguno (forma de `MetaModelo.validacion`). */
export const primerError = (...motivos: (string | null)[]): string | true =>
    motivos.find((m): m is string => !!m) ?? true;

/** Milisegundos de trabajo en horas y minutos: 30600000 → "8:30". */
export const tiempoEnHorasMinutos = (ms: number | null | undefined): string => {
    const minutos = Math.round(Math.max(0, Number(ms) || 0) / 60000);
    return `${Math.floor(minutos / 60)}:${String(minutos % 60).padStart(2, "0")}`;
};

/** Hora de la API ("HH:MM:SS") a "HH:MM" para los campos de hora; vacía si no hay. */
export const horaCorta = (hora: string | null | undefined): string => (hora ? hora.slice(0, 5) : "");

/** Hora del formulario a la API: vacía (o las 00:00, que Eneboo trata como vacía) es `null`. */
export const horaAApi = (hora: string | null | undefined): string | null => {
    if (sinTexto(hora)) return null;
    const corta = (hora as string).trim().slice(0, 5);
    return corta === "00:00" ? null : corta;
};

/** Fecha de la API ("AAAA-MM-DD") en dd/mm/aaaa, sin pasar por `Date` (sin desfases de zona). */
export const fechaDdMmAaaa = (fecha: string | null | undefined): string => {
    if (!fecha) return "";
    const [a, m, d] = fecha.slice(0, 10).split("-");
    return a && m && d ? `${d}/${m}/${a}` : fecha;
};

/** Fecha local en "AAAA-MM-DD" (formato de la API y de los campos de fecha). */
export const fechaApi = (fecha: Date): string =>
    `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;

/** `fecha` ("AAAA-MM-DD") más `dias` días, en el mismo formato. */
export const sumarDias = (fecha: string, dias: number): string => {
    const [a, m, d] = fecha.split("-").map(Number);
    return fechaApi(new Date(a, m - 1, d + dias));
};

/** Valor de un checkbox de `useModelo`/`QCheckbox`: llega como "true"/"false". */
export const comoBooleano = (valor: unknown): boolean => valor === true || valor === "true";

/** Todas las filas de un maestro, ordenadas por código (los maestros de planta son cortos). */
export const criteriaTodos: Criteria = { ...criteriaDefecto, orden: ["id", "ASC"], paginacion: { limite: 1000, pagina: 1 } };
