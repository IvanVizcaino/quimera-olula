import { MetaModelo } from "@olula/lib/dominio.ts";
import { CambiosSubfamilia, NuevaSubfamilia, Subfamilia } from "./diseño.ts";

export const metaNuevaSubfamilia: MetaModelo<NuevaSubfamilia> = {
    campos: {
        id: { requerido: true },
        descripcion: { requerido: true },
        familiaId: { requerido: true },
    },
};

export const metaCambiosSubfamilia: MetaModelo<CambiosSubfamilia> = {
    campos: {
        descripcion: { requerido: true },
    },
};

export const subfamiliaVacia = (): NuevaSubfamilia => ({
    id: "",
    descripcion: "",
    familiaId: "",
});

export const etiquetaSubfamilia = (s: Subfamilia): string => s.descripcion;
