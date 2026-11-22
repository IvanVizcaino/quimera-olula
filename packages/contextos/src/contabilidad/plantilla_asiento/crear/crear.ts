import { MetaModelo } from "@olula/lib/dominio.ts";
import { NuevaPlantillaAsiento } from "../diseño.ts";

export const metaNuevaPlantillaAsiento: MetaModelo<NuevaPlantillaAsiento> = {
    campos: {
        codigo: { requerido: true, maximo: 20 },
        descripcion: { requerido: true, maximo: 255 },
        concatenar: { requerido: false, maximo: 6 },
    },
};

export const nuevaPlantillaAsientoVacia = (): NuevaPlantillaAsiento => ({
    codigo: "",
    descripcion: "",
    concatenar: "",
});
