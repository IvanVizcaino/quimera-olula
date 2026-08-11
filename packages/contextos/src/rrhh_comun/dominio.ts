import { MetaModelo } from "@olula/lib/dominio.js";
import { RegistroJornada } from "./diseño.ts";

export const registroJornadaVacio: RegistroJornada = {
    id: "",
    empleadoId: "",
    empleado: "",
    fecha: new Date(0),
    horaEntrada: null,
    horaSalida: null,
    estado: "BORRADOR",
    observaciones: null,
    tiempoTotalPausas: 0,
    minutosJornada: 0,
    estadoBorrador: null,
    pausas: [],
};

export const ERR_HORA_SALIDA_JORNADA = "La hora de salida no puede ser anterior a la última hora registrada";

const horaSalidaValida = (jornada: RegistroJornada): boolean | string => {
    if (!jornada.horaSalida) return true;

    const horasRelevantes: string[] = [];
    if (jornada.horaEntrada) horasRelevantes.push(jornada.horaEntrada);
    for (const pausa of jornada.pausas) {
        horasRelevantes.push(pausa.horaInicio);
        if (pausa.horaFin) horasRelevantes.push(pausa.horaFin);
    }

    if (horasRelevantes.length === 0) return true;

    const maximo = horasRelevantes.reduce((a, b) => (b > a ? b : a));
    if (jornada.horaSalida < maximo) {
        return ERR_HORA_SALIDA_JORNADA;
    }
    return true;
};

export const minutosAHorasMinutos = (minutos: number): string => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${String(horas).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

export const puedeAprobarse = (jornada: RegistroJornada): boolean =>
    jornada.estado === 'BORRADOR' &&
    jornada.estadoBorrador === 'CERRADA' &&
    jornada.horaSalida !== null;

export const metaRegistroJornada: MetaModelo<RegistroJornada> = {
    campos: {
        horaEntrada: { tipo: "hora" },
        horaSalida: { tipo: "hora", validacion: horaSalidaValida, requerido: false },
        observaciones: { tipo: "texto" },
    },
    editable: (jornada: RegistroJornada) => jornada.estado === "BORRADOR",
};
