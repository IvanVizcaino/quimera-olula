import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.ts";
import { Zona } from "./diseño.ts";

export const zonaVacia = (): Zona => ({
    id: "",
    codigo: "",
    almacenId: "",
    descripcion: null,
});

export const metaZona: MetaModelo<Zona> = {
    campos: {
        codigo: { requerido: true, validacion: (m: Zona) => stringNoVacio(m.codigo) },
        almacenId: { requerido: true, validacion: (m: Zona) => stringNoVacio(m.almacenId) },
        descripcion: { requerido: false },
    },
};
