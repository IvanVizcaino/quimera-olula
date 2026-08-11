import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.js";

export type NuevaCarpeta = {
    nombre: string;
};

export const metaNuevaCarpeta: MetaModelo<NuevaCarpeta> = {
    campos: {
        nombre: { requerido: true, validacion: (carpeta: NuevaCarpeta) => stringNoVacio(carpeta.nombre) },
    },
};

export const carpetaVacia: NuevaCarpeta = {
    nombre: "",
};
