import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.js";
import { Modelo } from "@olula/lib/diseño.ts";

export interface NuevaGenerarSalida extends Modelo {
    zonaId: string;
}

export const metaGenerarSalida: MetaModelo<NuevaGenerarSalida> = {
    campos: {
        zonaId: { requerido: true, validacion: (m) => stringNoVacio(m.zonaId) },
    },
};

export const generarSalidaVacia: NuevaGenerarSalida = {
    zonaId: "",
};
