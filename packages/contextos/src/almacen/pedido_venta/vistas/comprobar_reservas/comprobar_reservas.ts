import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.js";
import { Modelo } from "@olula/lib/diseño.ts";

export interface ComprobarReservasForm extends Modelo {
    zonaId: string;
}

export const metaComprobarReservas: MetaModelo<ComprobarReservasForm> = {
    campos: {
        zonaId: { requerido: true, validacion: (m) => stringNoVacio(m.zonaId) },
    },
};

export const comprobarReservasVacio: ComprobarReservasForm = {
    zonaId: "",
};
