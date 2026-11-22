import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.ts";
import { NuevaZona } from "../../diseño.ts";
import { FUNCION_ZONA_POR_DEFECTO } from "../../dominio.ts";

export const metaNuevaZona: MetaModelo<NuevaZona> = {
    campos: {
        codigo: { requerido: true, validacion: (m) => stringNoVacio(m.codigo) },
        almacenId: { requerido: true, validacion: (m) => stringNoVacio(m.almacenId) },
        descripcion: { requerido: false },
        funcion: { requerido: true, validacion: (m) => stringNoVacio(m.funcion) },
    },
};

export const nuevaZonaVacia: NuevaZona = {
    codigo: "",
    almacenId: "",
    descripcion: null,
    funcion: FUNCION_ZONA_POR_DEFECTO,
};
