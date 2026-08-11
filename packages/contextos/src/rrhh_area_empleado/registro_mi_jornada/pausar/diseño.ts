import { MetaModelo } from "@olula/lib/dominio.js";

export type NuevaPausaForm = {
    horaInicio: string;
    causa: string;
};

export const nuevaPausaInicial: NuevaPausaForm = {
    horaInicio: new Date().toTimeString().slice(0, 5),
    causa: "",
};

export const metaNuevaPausa: MetaModelo<NuevaPausaForm> = {
    campos: {
        horaInicio: { tipo: "hora", requerido: true },
        causa: { tipo: "texto", requerido: true },
    },
};
