import { MetaModelo } from "@olula/lib/dominio.js";
import { LineaModulo, NuevaLineaModulo } from "./diseño.js";

export const metaLineaModulo: MetaModelo<LineaModulo> = {
    campos: {
        campoString: { requerido: true, minimo: 1 },
    },
};

export const metaNuevaLineaModulo: MetaModelo<NuevaLineaModulo> = {
    campos: {
        campoString: { requerido: true, minimo: 1 },
    },
};

export const nuevaLineaModuloVacia = (): NuevaLineaModulo => ({
    campoString: '',
});
