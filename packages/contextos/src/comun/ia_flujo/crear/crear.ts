import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.js";
import { NuevoIaFlujo } from "../diseño.js";

/**
 * Constante (no función) para evitar que useModelo resetee el formulario
 * en cada render: ver patrón "formularios de alta" en la guía del proyecto.
 */
export const nuevoIaFlujoVacio: NuevoIaFlujo = {
    nombre: "",
    descripcionCorta: "",
    contenido: "",
};

export const metaNuevoIaFlujo: MetaModelo<NuevoIaFlujo> = {
    campos: {
        nombre: {
            requerido: true,
            validacion: (m: NuevoIaFlujo) => stringNoVacio(m.nombre),
        },
        descripcionCorta: {
            requerido: true,
            validacion: (m: NuevoIaFlujo) => stringNoVacio(m.descripcionCorta),
        },
        contenido: {
            requerido: true,
            validacion: (m: NuevoIaFlujo) => stringNoVacio(m.contenido),
        },
    },
};
