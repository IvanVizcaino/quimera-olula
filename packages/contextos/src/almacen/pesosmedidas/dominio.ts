import { MetaModelo } from "@olula/lib/dominio.ts";
import { CambiosUnidadMedida, NuevaUnidadMedida, UnidadMedida } from "./diseño.ts";

export const metaNuevaUnidadMedida: MetaModelo<NuevaUnidadMedida> = {
    campos: {
        id: { requerido: true },
        descripcion: { requerido: true },
        magnitud: { requerido: true },
        factorConv: { requerido: true },
    },
};

export const metaCambiosUnidadMedida: MetaModelo<CambiosUnidadMedida> = {
    campos: {
        descripcion: { requerido: true },
        magnitud: { requerido: true },
        factorConv: { requerido: true },
    },
};

export const unidadMedidaVacia = (): NuevaUnidadMedida => ({
    id: "",
    descripcion: "",
    magnitud: "",
    factorConv: 1,
});

export const etiquetaUnidadMedida = (u: UnidadMedida): string =>
    u.descripcion ? `${u.id} - ${u.descripcion}` : u.id;
