/** Documento de proveedor desde el que se actualizan sus artículos (`facturac_general.actualizarartprov`). */
export type ActualizarArticulosProveedor =
    | "No Actualizar"
    | "Albaranes de proveedor"
    | "Facturas de proveedor";

/**
 * Configuración de compras: datos generales de facturación del escritorio
 * (tabla `facturac_general`) que afectan a las compras.
 */
export interface ConfigCompras {
    actualizarArticulosProveedor: ActualizarArticulosProveedor;
}

export type GetConfigCompras = () => Promise<ConfigCompras>;

export type PatchConfigCompras = (config: ConfigCompras) => Promise<void>;
