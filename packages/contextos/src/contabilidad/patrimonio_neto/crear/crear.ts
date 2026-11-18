import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevoPatrimonioNeto } from "../diseño.ts";

export const metaNuevoPatrimonioNeto: MetaModelo<NuevoPatrimonioNeto> = {
    campos: {
        descripcion: { requerido: true },
        ejercicioId: { requerido: true },
    },
};

export { nuevoPatrimonioNetoInicial } from "../dominio.ts";
