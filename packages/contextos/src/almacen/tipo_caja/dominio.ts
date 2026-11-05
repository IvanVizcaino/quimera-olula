import { NuevoTipoCaja, TipoCaja } from "./diseño.js";

/**
 * Tipo de caja vacío para inicialización del contexto del detalle
 */
export const tipoCajaInicial = (): TipoCaja => ({
    id: "",
    descripcion: "",
    sku: null,
    capacidad: null,
    prefijo: null,
});

/**
 * Objeto vacío para el formulario de creación.
 * Constante estable (no función) para evitar reseteos en useModelo.
 */
export const nuevoTipoCajaInicial: NuevoTipoCaja = {
    id: "",
    descripcion: "",
    sku: null,
    capacidad: null,
    prefijo: null,
};
