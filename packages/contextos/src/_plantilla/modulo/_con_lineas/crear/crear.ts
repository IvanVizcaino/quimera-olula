import { MetaModelo } from "@olula/lib/dominio.js";
import { nuevoModuloInicial } from "../../crear/crear.js";
import { NuevoModulo } from "../../diseño.js";

export const metaNuevoModulo: MetaModelo<NuevoModulo> = {
    campos: {
        campoString: { requerido: true, minimo: 3 },
    },
};

export const nuevoModLinVacio = (): NuevoModulo => nuevoModuloInicial();
