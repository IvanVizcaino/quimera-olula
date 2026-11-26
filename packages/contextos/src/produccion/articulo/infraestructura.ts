import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import { comoBooleano } from "../comun/dominio.ts";
import {
    CambiosFabricacion,
    ComponenteFabricacion,
    FabricacionArticulo,
    GetFabricacionArticulo,
    GetFabricacionArticulos,
    PatchFabricacionArticulo,
    PatchTareaComponente,
} from "./diseño.ts";

/**
 * Fabricación de los artículos: lee las columnas de produccion3 directamente (no depende de que
 * el plugin `produccion` esté activo, como la consulta de artículos de almacén).
 */
const baseUrl = `/produccion/articulo`;

export interface ComponenteFabricacionApi {
    id: string | number;
    articulo_id: string;
    descripcion: string | null;
    cantidad: number | null;
    tarea_proceso_id: string | number | null;
    tarea: string | null;
    codigo_tarea: string | null;
    por_lotes?: boolean | null;
}

export interface FabricacionArticuloApi {
    id: string;
    descripcion: string | null;
    fabricado: boolean | null;
    tipo_proceso_id: string | null;
    tipo_proceso: string | null;
    por_lotes?: boolean | null;
    sin_stock?: boolean | null;
    componentes?: ComponenteFabricacionApi[];
    avisos?: string[];
}

const componenteDesdeApi = (api: ComponenteFabricacionApi): ComponenteFabricacion => ({
    id: String(api.id),
    articuloId: api.articulo_id,
    descripcion: api.descripcion ?? "",
    cantidad: api.cantidad ?? 0,
    tareaProcesoId: api.tarea_proceso_id === null || api.tarea_proceso_id === undefined ? "" : String(api.tarea_proceso_id),
    tarea: api.tarea ?? "",
    codigoTarea: api.codigo_tarea ?? "",
    porLotes: !!api.por_lotes,
});

export const fabricacionDesdeApi = (api: FabricacionArticuloApi): FabricacionArticulo => ({
    id: api.id,
    descripcion: api.descripcion ?? "",
    fabricado: !!api.fabricado,
    tipoProcesoId: api.tipo_proceso_id ?? "",
    tipoProceso: api.tipo_proceso ?? "",
    porLotes: !!api.por_lotes,
    sinStock: !!api.sin_stock,
    componentes: (api.componentes ?? []).map(componenteDesdeApi),
    avisos: api.avisos ?? [],
});

export const cambiosFabricacionAApi = (c: CambiosFabricacion): { fabricado?: boolean; tipo_proceso_id?: string | null } => {
    const cambios: { fabricado?: boolean; tipo_proceso_id?: string | null } = {};
    if (c.fabricado !== undefined) cambios.fabricado = comoBooleano(c.fabricado);
    if (c.tipoProcesoId !== undefined) cambios.tipo_proceso_id = c.tipoProcesoId || null;
    return cambios;
};

const url = (id: string) => `${baseUrl}/${encodeURIComponent(id)}`;

export const getFabricacionArticulo: GetFabricacionArticulo = async (id) =>
    RestAPI.getItem<FabricacionArticulo, FabricacionArticuloApi>(url(id), fabricacionDesdeApi);

export const getFabricacionArticulos: GetFabricacionArticulos = async (criteria: Criteria) =>
    RestAPI.getQuery<FabricacionArticulo, FabricacionArticuloApi>(baseUrl, criteria, fabricacionDesdeApi);

export const patchFabricacionArticulo: PatchFabricacionArticulo = async (id, cambios) => {
    await RestAPI.patch(url(id), cambiosFabricacionAApi(cambios), "Error al guardar la fabricación del artículo");
};

/** `null` quita la tarea de consumo del componente. */
export const patchTareaComponente: PatchTareaComponente = async (id, componenteId, tareaProcesoId) => {
    await RestAPI.patch(
        `${url(id)}/componente/${encodeURIComponent(componenteId)}`,
        { tarea_proceso_id: tareaProcesoId || null },
        "Error al asignar la tarea al componente");
};
