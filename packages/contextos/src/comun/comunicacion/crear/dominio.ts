import type { JSONContent } from "@olula/componentes/moleculas/qeditor_enriquecido.tsx";
import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.ts";

export type NuevaComunicacionForm = {
    usuario_destino_id: string;
    nombre_usuario_destino: string;
    asunto: string;
};

export const jsonComunicacionVacio: JSONContent = {
    type: "doc",
    content: [{ type: "paragraph" }],
};

export const nuevaComunicacionVacia: NuevaComunicacionForm = {
    usuario_destino_id: "",
    nombre_usuario_destino: "",
    asunto: "",
};

export const metaNuevaComunicacion: MetaModelo<NuevaComunicacionForm> = {
    campos: {
        usuario_destino_id: {
            requerido: true,
            validacion: (comunicacion: NuevaComunicacionForm) =>
                stringNoVacio(comunicacion.usuario_destino_id),
        },
        nombre_usuario_destino: { requerido: false },
        asunto: {
            requerido: true,
            validacion: (comunicacion: NuevaComunicacionForm) =>
                stringNoVacio(comunicacion.asunto),
        },
    },
};
