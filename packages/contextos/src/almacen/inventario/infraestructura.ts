import {
    fechaLocalAApi,
    RegularizacionStockApi,
    regularizacionStockDesdeApi,
} from "#/almacen/stock/infraestructura.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    CambiosInventario,
    DeleteInventario,
    DeleteLineaInventario,
    GetInventario,
    GetInventarios,
    GetLineasInventario,
    Inventario,
    LineaInventario,
    PatchInventario,
    PatchRegularizarRestoInventario,
    PostInventario,
    PostLecturasInventario,
    PostLineaInventario,
    ResultadoCargaLecturas,
} from "./diseño.ts";

const baseUrl = `/almacen/inventario`;

// Las líneas de un inventario se piden de una vez (Eneboo las muestra todas).
const LIMITE_LINEAS = 10000;

interface InventarioApi {
    id: string;
    almacen_id: string;
    almacen: string | null;
    fecha: string;
    hora: string;
    observaciones: string | null;
}

export const inventarioDesdeApi = (api: InventarioApi): Inventario => ({
    id: api.id,
    almacenId: api.almacen_id,
    almacen: api.almacen,
    fecha: api.fecha,
    hora: api.hora,
    observaciones: api.observaciones,
});

const cambiosInventarioAApi = (cambios: CambiosInventario) => {
    const api: { observaciones?: string | null } = {};
    if (cambios.observaciones !== undefined) api.observaciones = cambios.observaciones;
    return api;
};

export const getInventario: GetInventario = async (id) =>
    RestAPI.getItem<Inventario, InventarioApi>(`${baseUrl}/${id}`, inventarioDesdeApi);

export const getInventarios: GetInventarios = async (criteria) =>
    RestAPI.getQuery<Inventario, InventarioApi>(baseUrl, criteria, inventarioDesdeApi);

export const postInventario: PostInventario = async (nuevo) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        {
            almacen_id: nuevo.almacenId,
            fecha: fechaLocalAApi(nuevo.fecha),
            hora: nuevo.hora,
            observaciones: nuevo.observaciones || null,
        },
        "Error al crear el inventario"
    );
    return respuesta.id;
};

export const patchInventario: PatchInventario = async (id, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${id}`,
        cambiosInventarioAApi(cambios),
        "Error al actualizar el inventario"
    );
};

export const deleteInventario: DeleteInventario = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, "Error al borrar el inventario");
};

export const getLineasInventario: GetLineasInventario = async (id) => {
    const respuesta = await RestAPI.getQuery<LineaInventario, RegularizacionStockApi>(
        `${baseUrl}/${id}/linea`,
        {
            filtro: [],
            orden: ["articulo_id", "ASC"],
            paginacion: { limite: LIMITE_LINEAS, pagina: 1 },
        },
        regularizacionStockDesdeApi,
    );
    return respuesta.datos;
};

export const postLineaInventario: PostLineaInventario = async (id, linea) => {
    const respuesta = await RestAPI.post(
        `${baseUrl}/${id}/linea`,
        {
            articulo_id: linea.articuloId,
            cantidad: linea.cantidad,
            motivo: linea.motivo || null,
        },
        "Error al crear la línea de inventario"
    );
    return respuesta.id;
};

export const deleteLineaInventario: DeleteLineaInventario = async (id, lineaId) => {
    await RestAPI.delete(
        `${baseUrl}/${id}/linea/${lineaId}`,
        "Error al borrar la línea de inventario"
    );
};

export const postLecturasInventario: PostLecturasInventario = async (id, lecturas) =>
    RestAPI.query<object, ResultadoCargaLecturas>(
        `${baseUrl}/${id}/lecturas`,
        {
            contenido: lecturas.contenido,
            separador: lecturas.separador,
            ignorar_primera_linea: lecturas.ignorarPrimeraLinea,
        },
        "Error al cargar el fichero de inventario"
    );

export const patchRegularizarRestoInventario: PatchRegularizarRestoInventario = async (id) => {
    const respuesta = await RestAPI.patch(
        `${baseUrl}/${id}/regularizar_resto`,
        {},
        "Error al regularizar el resto del inventario"
    ) as unknown as { lineas: number };
    return respuesta.lineas;
};
