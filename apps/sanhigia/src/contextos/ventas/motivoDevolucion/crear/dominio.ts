import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.js";
import { NuevoMotivoDevolucion } from "../diseño.ts";

export const nuevoMotivoDevolucionVacio: NuevoMotivoDevolucion = {
    tipo: "",
    descripcion: "",
    otros: false,
};

export const metaNuevoMotivoDevolucion: MetaModelo<NuevoMotivoDevolucion> = {
    campos: {
        tipo: {
            requerido: true,
            validacion: (motivoDevolucion: NuevoMotivoDevolucion) =>
                stringNoVacio(String(motivoDevolucion.tipo ?? "")),
        },
        descripcion: {
            requerido: true,
            validacion: (motivoDevolucion: NuevoMotivoDevolucion) =>
                stringNoVacio(String(motivoDevolucion.descripcion ?? "")),
        },
        otros: { requerido: true, tipo: "checkbox" },
    },
};