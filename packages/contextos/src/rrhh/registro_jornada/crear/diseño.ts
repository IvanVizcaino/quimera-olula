import { MetaModelo } from "@olula/lib/dominio.js";

export type NuevaJornadaForm = {
    empleadoId: string;
    nombre: string;
    fecha: Date;
    horaEntrada: string;
    horaSalida: string;
    observaciones: string;
};

export const nuevaJornadaFormInicial: NuevaJornadaForm = {
    empleadoId: "",
    nombre: "",
    fecha: new Date(),
    horaEntrada: "",
    horaSalida: "",
    observaciones: "",
};

export const ERR_HORA_SALIDA_NUEVA_JORNADA = "La hora de salida no puede ser anterior a la hora de entrada";

const horaSalidaValida = (jornada: NuevaJornadaForm): boolean | string => {
    if (jornada.horaSalida && jornada.horaEntrada && jornada.horaSalida < jornada.horaEntrada) {
        return ERR_HORA_SALIDA_NUEVA_JORNADA;
    }
    return true;
};

export const metaNuevaJornada: MetaModelo<NuevaJornadaForm> = {
    campos: {
        empleadoId: { tipo: "texto", requerido: true },
        fecha: { tipo: "fecha", requerido: true },
        horaEntrada: { tipo: "hora" },
        horaSalida: { tipo: "hora", validacion: horaSalidaValida },
        observaciones: { tipo: "texto" },
    },
};
