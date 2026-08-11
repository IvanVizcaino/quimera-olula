import { MetaModelo } from "@olula/lib/dominio.js";
import { PausaJornada, RegistroJornada } from "../diseño.ts";

export type PausaForm = {
    horaInicio: string;
    horaFin: string | null;
    causa: string;
};

export const pausaFormInicial: PausaForm = {
    horaInicio: "",
    horaFin: null,
    causa: "",
};

export const pausaFormDesde = (pausa: PausaJornada): PausaForm => ({
    horaInicio: pausa.horaInicio,
    horaFin: pausa.horaFin,
    causa: pausa.causa,
});

export const ERR_PAUSA_INICIO_ANTERIOR_ENTRADA = "La hora de inicio de la pausa no puede ser anterior a la hora de entrada de la jornada";
export const ERR_PAUSA_INICIO_POSTERIOR_SALIDA = "La hora de inicio de la pausa no puede ser posterior a la hora de salida de la jornada";
export const ERR_PAUSA_FIN_POSTERIOR_SALIDA = "La hora de fin de la pausa no puede ser posterior a la hora de salida de la jornada";
export const ERR_PAUSA_FIN_ANTERIOR_ENTRADA = "La hora de fin de la pausa no puede ser anterior a la hora de entrada de la jornada";
export const ERR_PAUSA_SOLAPA = "La pausa se solapa con otra pausa existente";

const solapaConPausa = (pausa: PausaForm, other: PausaJornada): boolean => {
    const inicioNueva = pausa.horaInicio;
    const finNueva = pausa.horaFin ?? "99:99";
    const inicioOtra = other.horaInicio;
    const finOtra = other.horaFin ?? "99:99";
    return inicioNueva < finOtra && inicioOtra < finNueva;
};

export const metaPausaForm = (
    jornada: RegistroJornada,
    pausaId?: string
): MetaModelo<PausaForm> => ({
    campos: {
        horaInicio: {
            tipo: "hora",
            requerido: true,
            validacion: (pausa) => {
                if (jornada.horaEntrada && pausa.horaInicio < jornada.horaEntrada) {
                    return ERR_PAUSA_INICIO_ANTERIOR_ENTRADA;
                }
                if (jornada.horaSalida && pausa.horaInicio > jornada.horaSalida) {
                    return ERR_PAUSA_INICIO_POSTERIOR_SALIDA;
                }
                const otrasPausas = jornada.pausas.filter((p) => p.id !== pausaId);
                const solapa = otrasPausas.some((other) => solapaConPausa(pausa, other));
                if (solapa) {
                    return ERR_PAUSA_SOLAPA;
                }
                return true;
            },
        },
        horaFin: {
            tipo: "hora",
            validacion: (pausa) => {
                if (pausa.horaFin === null) return true;
                if (jornada.horaSalida && pausa.horaFin > jornada.horaSalida) {
                    return ERR_PAUSA_FIN_POSTERIOR_SALIDA;
                }
                if (jornada.horaEntrada && pausa.horaFin < jornada.horaEntrada) {
                    return ERR_PAUSA_FIN_ANTERIOR_ENTRADA;
                }
                const otrasPausas = jornada.pausas.filter((p) => p.id !== pausaId);
                const solapa = otrasPausas.some((other) => solapaConPausa(pausa, other));
                if (solapa) {
                    return ERR_PAUSA_SOLAPA;
                }
                return true;
            },
        },
        causa: { tipo: "texto", requerido: true },
    },
});
