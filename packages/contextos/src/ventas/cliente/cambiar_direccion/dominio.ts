import { MetaModelo } from "@olula/lib/dominio.js";
import { DirCliente } from "../diseño.ts";

export const metaDireccion: MetaModelo<DirCliente> = {
    campos: {
        tipo_via: { requerido: true },
        nombre_via: { requerido: true },
        ciudad: { requerido: true },
    }
};
