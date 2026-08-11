import { MetaModelo } from "@olula/lib/dominio.js";

export type AnulacionJornadaForm = {
    motivo: string;
};

export const anulacionJornadaInicial: AnulacionJornadaForm = {
    motivo: "",
};

export const metaAnulacionJornada: MetaModelo<AnulacionJornadaForm> = {
    campos: {
        motivo: { tipo: "texto" },
    },
};
