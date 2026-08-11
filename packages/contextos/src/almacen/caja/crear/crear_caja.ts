import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.ts";
import { NuevaCaja } from "../diseño.ts";

export const nuevaCajaVacia: NuevaCaja = {
    idUbicacion: "",
};

export const metaNuevaCaja: MetaModelo<NuevaCaja> = {
    campos: {
        idUbicacion: {
            requerido: true,
            validacion: (m: NuevaCaja) => stringNoVacio(m.idUbicacion),
        },
    },
};
