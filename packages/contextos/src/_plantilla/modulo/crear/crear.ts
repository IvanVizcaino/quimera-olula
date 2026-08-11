import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevoModulo } from "../diseño.js";

export const metaNuevoModulo: MetaModelo<NuevoModulo> = {
    campos: {
        campoString: { requerido: true },
        campoTexto: { requerido: false },
        campoOpcion: { requerido: true },
        campoFecha: { requerido: true },
    },
};

export const nuevoModuloInicial = (): NuevoModulo => ({
    campoString: "",
    campoTexto: "",
    campoOpcion: "opcion1",
    campoNumero: 0,
    campoFecha: new Date(),
});
