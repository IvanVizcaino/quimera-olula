import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.js";
import { NuevaIaMemoria } from "../diseño.js";

/**
 * Constante (no función) para evitar que useModelo resetee el formulario
 * en cada render: ver patrón "formularios de alta" en la guía del proyecto.
 */
export const nuevaIaMemoriaVacia: NuevaIaMemoria = {
    titulo: "",
    contenido: "",
};

export const metaNuevaIaMemoria: MetaModelo<NuevaIaMemoria> = {
    campos: {
        titulo: {
            requerido: true,
            validacion: (m: NuevaIaMemoria) => stringNoVacio(m.titulo),
        },
        contenido: {
            requerido: true,
            validacion: (m: NuevaIaMemoria) => stringNoVacio(m.contenido),
        },
    },
};
