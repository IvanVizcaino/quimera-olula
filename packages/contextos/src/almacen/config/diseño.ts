/**
 * Configuración de almacén: los datos generales de almacén del escritorio
 * (tabla `factalma_general`).
 */
export interface ConfigAlmacen {
    /** I.V.A. por defecto (`codimpuesto`): código de `impuestos`; vacío si no hay. */
    impuestoId: string;
    /** Utilizar I.V.A. por defecto (`usarivadefecto`). */
    usarIvaDefecto: boolean;
}

export type GetConfigAlmacen = () => Promise<ConfigAlmacen>;

export type PatchConfigAlmacen = (config: ConfigAlmacen) => Promise<void>;
