import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.js";
import { NuevaOrdenAlmacen } from "../../diseño.ts";

export const metaNuevaOrden: MetaModelo<NuevaOrdenAlmacen> = {
    campos: {
        tipoOrden: {
            requerido: true,
            validacion: (m) => stringNoVacio(m.tipoOrden),
        },
        almacenId: {
            requerido: true,
            validacion: (m) => stringNoVacio(m.almacenId),
        },
        fecha: {
            requerido: true,
            tipo: "fecha",
            validacion: (m) => !!m.fecha,
        },
        abierta: {
            requerido: true,
            tipo: "checkbox",
        },
    },
};
