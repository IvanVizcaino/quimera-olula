import { MetaModelo } from "@olula/lib/dominio.ts";
import { horaAApi, motivoTextoNoValido, primerError } from "../comun/dominio.ts";
import { Horario, HorasHorario, NuevoHorario } from "./diseño.ts";

/** Longitudes de pr_horarios.mtd. */
export const LONGITUD_CODIGO_HORARIO = 8;
export const LONGITUD_DESCRIPCION_HORARIO = 100;

const minutos = (hora: string | null): number | null => {
    if (!hora) return null;
    const [h, m] = hora.split(":").map(Number);
    return h * 60 + m;
};

/** Las validaciones de pr_horarios.qs (como el servidor): cada tramo con entrada y salida, y las horas en orden. */
export const motivoHorasNoValidas = (h: HorasHorario): string | null => {
    const em = minutos(horaAApi(h.horaEntradaManana));
    const sm = minutos(horaAApi(h.horaSalidaManana));
    const et = minutos(horaAApi(h.horaEntradaTarde));
    const st = minutos(horaAApi(h.horaSalidaTarde));
    if (em !== null && sm === null) return "Falta la hora de salida por la mañana";
    if (sm !== null && em === null) return "Falta la hora de entrada por la mañana";
    if (et !== null && st === null) return "Falta la hora de salida por la tarde";
    if (st !== null && et === null) return "Falta la hora de entrada por la tarde";
    if (em !== null && sm !== null && sm <= em) return "La salida por la mañana debe ser posterior a la entrada";
    if (sm !== null && et !== null && et <= sm) return "La entrada por la tarde debe ser posterior a la salida por la mañana";
    if (et !== null && st !== null && st <= et) return "La salida por la tarde debe ser posterior a la entrada";
    return null;
};

/** Milisegundos de trabajo de las horas (mañana más tarde), como `tiempo` del servidor. */
export const tiempoHorario = (h: HorasHorario): number => {
    const tramo = (desde: string, hasta: string) => {
        const d = minutos(horaAApi(desde));
        const a = minutos(horaAApi(hasta));
        return d === null || a === null ? 0 : (a - d) * 60000;
    };
    return tramo(h.horaEntradaManana, h.horaSalidaManana) + tramo(h.horaEntradaTarde, h.horaSalidaTarde);
};

export const validarHorario = (h: Pick<NuevoHorario, "id" | "descripcion"> & HorasHorario): string | true =>
    primerError(
        motivoTextoNoValido(h.id, "El código", LONGITUD_CODIGO_HORARIO),
        motivoTextoNoValido(h.descripcion, "La descripción", LONGITUD_DESCRIPCION_HORARIO),
        motivoHorasNoValidas(h),
    );

const campos = {
    id: { requerido: true },
    descripcion: { requerido: true },
    horaEntradaManana: { requerido: false, tipo: "hora" as const },
    horaSalidaManana: { requerido: false, tipo: "hora" as const },
    horaEntradaTarde: { requerido: false, tipo: "hora" as const },
    horaSalidaTarde: { requerido: false, tipo: "hora" as const },
};

const horasVacias: HorasHorario = { horaEntradaManana: "", horaSalidaManana: "", horaEntradaTarde: "", horaSalidaTarde: "" };

export const horarioVacio = (): Horario => ({ id: "", descripcion: "", ...horasVacias, tiempo: 0 });

/** Constante estable (no función) para el formulario de alta. */
export const nuevoHorarioVacio: NuevoHorario = { id: "", descripcion: "", ...horasVacias };

export const metaHorario: MetaModelo<Horario> = { campos, validacion: validarHorario };
export const metaNuevoHorario: MetaModelo<NuevoHorario> = { campos, validacion: validarHorario };
