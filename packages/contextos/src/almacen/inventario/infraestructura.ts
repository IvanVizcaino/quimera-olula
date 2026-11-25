import {
    fechaLocalAApi,
    RegularizacionStockApi,
    regularizacionStockDesdeApi,
} from "#/almacen/stock/infraestructura.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    ArticuloLeido,
    CambiarLineaInventario,
    CambiosInventario,
    DeleteInventario,
    DeleteLineaInventario,
    GetInventario,
    GetInventarios,
    GetLineasInventario,
    Inventario,
    LineaInventario,
    LineaRechazada,
    OpcionesCargaFichero,
    PatchInventario,
    PatchRegularizarRestoInventario,
    PostFicheroInventario,
    PostInventario,
    PostLineaInventario,
    ResultadoCargaFichero,
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

/**
 * Una línea no se puede cambiar en el servidor (Eneboo tampoco deja cambiar
 * la cantidad en edición): se borra y se vuelve a crear con la nueva
 * cantidad, con lo que el stock se recalcula igual. Las lecturas de fichero
 * de esa línea se pierden con el borrado.
 */
export const cambiarLineaInventario: CambiarLineaInventario = async (id, linea, cambios) => {
    await deleteLineaInventario(id, linea.id);
    return postLineaInventario(id, { ...cambios, articuloId: linea.articuloId });
};

interface ArticuloLeidoApi {
    articulo_id: string;
    descripcion: string | null;
    lecturas: number;
    cantidad: number;
    cantidad_actual: number;
}

export interface ResultadoCargaFicheroApi {
    cargado: boolean;
    lecturas: number;
    lineas: number;
    articulos: ArticuloLeidoApi[];
    rechazadas: LineaRechazada[];
}

const articuloLeidoDesdeApi = (api: ArticuloLeidoApi): ArticuloLeido => ({
    articuloId: api.articulo_id,
    descripcion: api.descripcion,
    lecturas: api.lecturas,
    cantidad: api.cantidad,
    cantidadActual: api.cantidad_actual,
});

export const resultadoCargaFicheroDesdeApi = (
    api: ResultadoCargaFicheroApi
): ResultadoCargaFichero => ({
    cargado: api.cargado,
    lecturas: api.lecturas,
    lineas: api.lineas,
    articulos: (api.articulos ?? []).map(articuloLeidoDesdeApi),
    rechazadas: (api.rechazadas ?? []).map((r) => ({ ...r, cantidad: String(r.cantidad ?? "") })),
});

/** Formulario multipart de `POST /almacen/inventario/<id>/fichero`. */
export const cargaFicheroAFormData = (fichero: File, opciones: OpcionesCargaFichero): FormData => {
    const formData = new FormData();
    formData.append("fichero", fichero, fichero.name);
    if (opciones.separador) formData.append("separador", opciones.separador);
    formData.append("ignorar_primera_linea", String(opciones.ignorarPrimeraLinea));
    formData.append("simular", String(opciones.simular));
    formData.append("omitir_rechazadas", String(opciones.omitirRechazadas));
    return formData;
};

export const postFicheroInventario: PostFicheroInventario = async (id, fichero, opciones) => {
    const respuesta = await RestAPI.query<FormData, ResultadoCargaFicheroApi>(
        `${baseUrl}/${id}/fichero`,
        cargaFicheroAFormData(fichero, opciones),
        "Error al cargar el fichero de inventario"
    );
    return resultadoCargaFicheroDesdeApi(respuesta);
};

export const patchRegularizarRestoInventario: PatchRegularizarRestoInventario = async (id) => {
    const respuesta = await RestAPI.patch(
        `${baseUrl}/${id}/regularizar_resto`,
        {},
        "Error al regularizar el resto del inventario"
    ) as unknown as { lineas: number };
    return respuesta.lineas;
};
