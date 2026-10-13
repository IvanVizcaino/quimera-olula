import { Entidad } from "@olula/lib/diseño.ts";

/** Línea de kit fijo (`articuloscomp` con `idtipoopcionart` NULL). Sin opciones variables TPV. */
export interface ComponenteArticuloKit extends Entidad {
    id: string;
    /** Referencia del componente (`refcomponente`). */
    articuloId: string;
    descripcionArticulo?: string;
    cantidad: number;
    /** Solo con plugin `pesos_medidas` (`codunidad`). */
    unidadId?: string | null;
    descripcionUnidad?: string | null;
}

export interface ComposicionArticuloKit {
    articuloId: string;
    /** `articulos.stockcomp` (Eneboo «Control stock componentes»). Irreversible una vez guardado. */
    stockPorComponentes: boolean;
    componentes: ComponenteArticuloKit[];
}

export type GetComposicionArticuloKit = (articuloId: string) => Promise<ComposicionArticuloKit>;

export type ComponenteArticuloKitPatch = {
    /** Vacío u omitido = fila nueva en `articuloscomp`. */
    id?: string;
    articuloId: string;
    cantidad: number;
    unidadId?: string | null;
};

export type PatchComposicionArticuloKit = (
    articuloId: string,
    componentes: ComponenteArticuloKitPatch[],
    /** Solo se envía al activar `stockcomp` (true); la API rechaza desactivarlo. */
    activarStockPorComponentes?: boolean,
) => Promise<void>;
