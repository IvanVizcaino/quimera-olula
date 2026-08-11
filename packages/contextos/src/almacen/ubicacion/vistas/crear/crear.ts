export type NuevaUbicacion = {
    codigo: string;
    zonaId: string;
};

import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.ts";

export const nuevaUbicacionVacia: NuevaUbicacion = {
    codigo: "",
    zonaId: "",
};

export const metaNuevaUbicacion: MetaModelo<NuevaUbicacion> = {
    campos: {
        codigo: { requerido: true, validacion: (m) => stringNoVacio(m.codigo || "") },
        zonaId: { requerido: true, validacion: (m) => stringNoVacio(m.zonaId || "") },
    },
};
