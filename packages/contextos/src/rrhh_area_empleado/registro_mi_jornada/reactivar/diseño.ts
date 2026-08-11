import { MetaModelo } from "@olula/lib/dominio.js";

export type ReactivacionJornadaForm = {
    horaFin: string;
};

export const reactivacionJornadaInicial: ReactivacionJornadaForm = {
    horaFin: new Date().toTimeString().slice(0, 5),
};

export const metaReactivacionJornada: MetaModelo<ReactivacionJornadaForm> = {
    campos: {
        horaFin: { tipo: "hora", requerido: true },
    },
};
