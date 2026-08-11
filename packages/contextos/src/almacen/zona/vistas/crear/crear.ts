import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.ts";
import { NuevaZona } from "../../diseño.ts";

export const metaNuevaZona: MetaModelo<NuevaZona> = {
    campos: {
        codigo: { requerido: true, validacion: (m) => stringNoVacio(m.codigo) },
        almacenId: { requerido: true, validacion: (m) => stringNoVacio(m.almacenId) },
        descripcion: { requerido: false },
    },
};

export const nuevaZonaVacia: NuevaZona = {
    codigo: "",
    almacenId: "",
    descripcion: null,
};
