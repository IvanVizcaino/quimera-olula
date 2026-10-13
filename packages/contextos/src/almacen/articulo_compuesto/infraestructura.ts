import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    ComposicionArticuloKit,
    ComponenteArticuloKit,
    ComponenteArticuloKitPatch,
    GetComposicionArticuloKit,
    PatchComposicionArticuloKit,
} from "./diseño.ts";

/**
 * Contrato HTTP olula_servidor (T2.6, rama migracion_cremacafe).
 *
 * GET/PATCH `/almacen/articulo/{articuloId}/compuesto` — kits fijos
 * (`idtipoopcionart` null/0). PATCH envía la lista completa de componentes.
 */

const urlCompuesto = (articuloId: string) => `/almacen/articulo/${encodeURIComponent(articuloId)}/compuesto`;

interface ComponenteArticuloApi {
    id: string | null;
    articulo_id: string;
    descripcion_articulo?: string | null;
    cantidad: number;
    unidad_id?: string | null;
    descripcion_unidad?: string | null;
    id_tipo_opcion_art?: number | null;
}

interface ArticuloCompuestoApi {
    articulo_id: string;
    stock_por_componentes?: boolean;
    componentes: ComponenteArticuloApi[];
}

const esKitFijo = (api: ComponenteArticuloApi) =>
    api.id_tipo_opcion_art == null || api.id_tipo_opcion_art === 0;

const componenteDesdeApi = (api: ComponenteArticuloApi): ComponenteArticuloKit => ({
    id: api.id ?? "",
    articuloId: api.articulo_id,
    descripcionArticulo: api.descripcion_articulo ?? undefined,
    cantidad: api.cantidad,
    unidadId: api.unidad_id ?? null,
    descripcionUnidad: api.descripcion_unidad ?? undefined,
});

const composicionDesdeApi = (api: ArticuloCompuestoApi): ComposicionArticuloKit => ({
    articuloId: api.articulo_id,
    stockPorComponentes: Boolean(api.stock_por_componentes),
    componentes: api.componentes.filter(esKitFijo).map(componenteDesdeApi),
});

const componenteAApi = (c: ComponenteArticuloKitPatch): ComponenteArticuloApi => ({
    id: c.id || null,
    articulo_id: c.articuloId,
    cantidad: c.cantidad,
    unidad_id: c.unidadId ?? null,
    id_tipo_opcion_art: null,
});

export const getComposicionArticuloKit: GetComposicionArticuloKit = async (articuloId) =>
    RestAPI.getItem<ComposicionArticuloKit, ArticuloCompuestoApi>(
        urlCompuesto(articuloId),
        composicionDesdeApi,
        "Error al cargar componentes del artículo",
    );

export const patchComposicionArticuloKit: PatchComposicionArticuloKit = async (
    articuloId,
    componentes,
    activarStockPorComponentes,
) => {
    await RestAPI.patch(
        urlCompuesto(articuloId),
        {
            componentes: componentes.map(componenteAApi),
            ...(activarStockPorComponentes ? { stock_por_componentes: true } : {}),
        },
        "Error al guardar componentes del artículo",
    );
};

/** Exportado para tests de mapeo API ↔ dominio. */
export const composicionDesdeApiParaTest = composicionDesdeApi;
export const cuerpoPatchParaTest = (
    componentes: ComponenteArticuloKitPatch[],
    activar?: boolean,
) => ({
    componentes: componentes.map(componenteAApi),
    ...(activar ? { stock_por_componentes: true } : {}),
});
export const componenteAApiParaTest = componenteAApi;
