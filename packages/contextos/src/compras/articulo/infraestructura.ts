import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import ApiUrls from "../comun/urls.ts";
import {
    Articulo,
    CambiosArticulo,
    GetArticulo,
    GetArticulos,
    GetTagsArticulo,
    PatchArticulo,
    PostArticulo,
    TagArticulo,
} from "./diseño.ts";
import { filtroArticulosCompra } from "./dominio.ts";

interface ArticuloApi {
    id: string;
    descripcion: string;
    observaciones: string | null;
    familia_id: string | null;
    descripcion_familia: string | null;
    grupo_iva_producto_id: string | null;
    sin_stock: boolean;
    se_compra: boolean;
    se_vende?: boolean;
    descripcion_subfamilia?: string | null;
    total_disponible?: number | null;
}

interface TagArticuloApi {
    id: string;
    descripcion: string;
    grupo_iva_producto_id: string | null;
}

const baseUrl = new ApiUrls().ARTICULO;

const tagArticuloDesdeApi = (t: TagArticuloApi): TagArticulo => ({
    id: t.id,
    descripcion: t.descripcion,
    grupoIvaProductoId: t.grupo_iva_producto_id ?? "",
});

export const articuloDesdeApi = (api: ArticuloApi): Articulo => ({
    id: api.id,
    descripcion: api.descripcion,
    observaciones: api.observaciones ?? "",
    familiaId: api.familia_id ?? "",
    descripcionFamilia: api.descripcion_familia ?? "",
    grupoIvaProductoId: api.grupo_iva_producto_id ?? "",
    noStock: api.sin_stock,
    seCompra: api.se_compra,
    seVende: api.se_vende ?? false,
    descripcionSubfamilia: api.descripcion_subfamilia,
    totalDisponible: api.total_disponible,
});

const oNulo = (valor: string): string | null => valor === "" ? null : valor;

const cambiosArticuloAApi = (cambios: CambiosArticulo): Record<string, unknown> => {
    const api: Record<string, unknown> = {};

    if (cambios.descripcion !== undefined) api.descripcion = cambios.descripcion;
    if (cambios.observaciones !== undefined) api.observaciones = oNulo(cambios.observaciones);
    if (cambios.familiaId !== undefined) api.familia_id = oNulo(cambios.familiaId);
    if (cambios.grupoIvaProductoId !== undefined) api.grupo_iva_producto_id = oNulo(cambios.grupoIvaProductoId);

    return api;
};

export const getArticulo: GetArticulo = async (id) =>
    await RestAPI.getItem<Articulo, ArticuloApi>(
        `${baseUrl}/${id}`,
        articuloDesdeApi,
        "Error al obtener el artículo"
    );

export const getArticulos: GetArticulos = async (criteria) =>
    await RestAPI.getQuery<Articulo, ArticuloApi>(
        baseUrl,
        { ...criteria, filtro: filtroArticulosCompra(criteria.filtro) },
        articuloDesdeApi,
        "Error al obtener los artículos"
    );

export const postArticulo: PostArticulo = async (articulo) =>
    await RestAPI.post(
        baseUrl,
        { descripcion: articulo.descripcion ?? "" },
        "Error al crear el artículo"
    ).then((respuesta) => String(respuesta.id));

export const patchArticulo: PatchArticulo = async (id, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${id}`,
        cambiosArticuloAApi(cambios),
        "Error al guardar el artículo"
    );
};

export const getTagsArticulo: GetTagsArticulo = async (filtro, orden) => {
    const q = criteriaQuery(filtro, orden);

    return RestAPI.get<{ datos: TagArticuloApi[] }>(`${baseUrl}/tags${q}`).then(
        (respuesta) => respuesta.datos.map(tagArticuloDesdeApi)
    );
};
