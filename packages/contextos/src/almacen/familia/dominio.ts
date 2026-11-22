import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.ts";
import { NuevaFamilia } from "./diseño";

// export const nuevaFamiliaVacia: Partial<Familia> = {
export const nuevaFamiliaVacia: NuevaFamilia = {
    id: "",
    descripcion: "",
    unidadId: "",
};

export const metaNuevaFamilia: MetaModelo<NuevaFamilia> = {
    campos: {
        descripcion: { requerido: true, validacion: (m) => stringNoVacio(m.descripcion || "") },
    },
};

