import { MetaModelo, puede, stringNoVacio } from "@olula/lib/dominio.ts";
import { IaFlujo } from "./diseño.ts";

/**
 * Flujo vacío para inicialización del contexto de detalle.
 */
export const iaFlujoVacio: IaFlujo = {
    id: "",
    nombre: "",
    descripcionCorta: "",
    contenido: "",
    activo: true,
    creadoPor: "",
    creadoEn: new Date(0),
    actualizadoEn: new Date(0),
};

/**
 * Metadatos del formulario de detalle: validaciones y configuración de campos.
 * El formulario completo se deshabilita si el usuario no tiene permiso de
 * edición sobre la regla "comun.ia_flujo".
 *
 * Nota: `activo` no forma parte del formulario editable. Se alterna mediante
 * la acción "Activar/Desactivar" (evento de máquina), no vía checkbox, porque
 * `convertirCampoDesdeUI` (packages/lib/src/dominio.ts) no convierte el valor
 * de un checkbox a boolean real (ver comentario "Ver un caso y cambiar a
 * boolean" en esa función): usarlo aquí guardaría el string "true"/"false"
 * en un campo de dominio tipado como boolean.
 */
export const metaIaFlujo: MetaModelo<IaFlujo> = {
    campos: {
        nombre: {
            requerido: true,
            validacion: (m: IaFlujo) => stringNoVacio(m.nombre),
        },
        descripcionCorta: {
            requerido: true,
            validacion: (m: IaFlujo) => stringNoVacio(m.descripcionCorta),
        },
        contenido: {
            requerido: true,
            validacion: (m: IaFlujo) => stringNoVacio(m.contenido),
        },
    },
    editable: () => puede("comun.ia_flujo"),
};
