import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Filtro, Orden } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import {
    Articulo, ArticuloAlmacen, ArticuloAPI,
    DeleteArticulo,
    GetArticulo,
    GetArticulos,
    LeerCodBarras,
    PatchArticulo,
    PostArticulo
} from "./diseño.ts";

const baseUrlArticulo = "/almacen/articulo";

type ArticuloAlmacenApi = ArticuloAlmacen;

const articuloAlmacenDesdeApi = (t: ArticuloAlmacenApi): ArticuloAlmacen => t;

export const obtenerArticulosAlmacen = async (filtro: Filtro, orden: Orden): Promise<ArticuloAlmacen[]> => {
    const q = criteriaQuery(filtro, orden);

    return RestAPI.get<{ datos: ArticuloAlmacenApi[] }>(baseUrlArticulo + q).then((respuesta) => respuesta.datos.map(articuloAlmacenDesdeApi));
}


export const ArticuloFromApi = (ArticuloApi: ArticuloAPI): Articulo => ({
    ...ArticuloApi,
});

export const ArticuloToApi = (Articulo: Articulo): ArticuloAPI => ({
    ...Articulo,
});

export const getArticulo: GetArticulo = async (id) =>
    await RestAPI.get<{ datos: ArticuloAPI }>(`${baseUrlArticulo}/${id}`).then((respuesta) =>
        ArticuloFromApi(respuesta.datos)
    );

export const getArticulos: GetArticulos = async (
    filtro,
    orden,
    paginacion?
) => {
    const q = criteriaQuery(filtro, orden, paginacion);
    const respuesta = await RestAPI.get<{ datos: ArticuloAPI[]; total: number }>(baseUrlArticulo + q);
    return { datos: respuesta.datos.map(ArticuloFromApi), total: respuesta.total };
};

export const postArticulo: PostArticulo = async (Articulo) => {
    return await RestAPI.post(baseUrlArticulo, Articulo, "Error al guardar Articulo").then(
        (respuesta) => respuesta.id
    );
};

export const patchArticulo: PatchArticulo = async (id, Articulo) => {
    const apiArticulo = ArticuloToApi(Articulo as Articulo);
    const ArticuloSinNulls = Object.fromEntries(
        Object.entries(apiArticulo).map(([k, v]) => [k, v === null ? "" : v])
    );
    await RestAPI.patch(`${baseUrlArticulo}/${id}`, ArticuloSinNulls, "Error al guardar Articulo");
};

export const deleteArticulo: DeleteArticulo = async (id) => {
    await RestAPI.delete(`${baseUrlArticulo}/${id}`, "Error al borrar Articulo");
};

export const leerCodBarras: LeerCodBarras = async (codigo) =>
    await RestAPI.get<{ datos: ArticuloAPI }>(`${baseUrlArticulo}/sku_lote/${codigo}`).then((respuesta) =>
        ArticuloFromApi(respuesta.datos)
    );
