/**
 * Regenerar movimientos de stock (Eneboo `acRegeneraMovimientos`, ext. `articulos_comp`,
 * proceso de mantenimiento). Contrato API: `POST /almacen/regenera_movimientos`.
 */
export interface FormRegenerarMovimientos {
    almacenId: string;
    /** Referencias de los artículos del filtro. */
    articulos: string[];
    /** Opcional: todos los artículos de la familia. */
    familiaId: string;
}

export interface PeticionRegenerarMovimientos {
    almacenId: string;
    articulos?: string[];
    familiaId?: string;
}

export interface ResumenRegeneracion {
    articulos: number;
    lineas: number;
    stocksRevisados: number;
    /** Líneas regeneradas por tipo de documento (`pedidoscli`, `albaranescli`, ...). */
    porDocumento: Record<string, number>;
}

export type PostRegenerarMovimientos = (
    peticion: PeticionRegenerarMovimientos,
) => Promise<ResumenRegeneracion>;
