import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "#/almacen/comun/urls.ts";
import {
    GetExportLineasInventarioCsv,
    GetInventario,
    GetInventarios,
    GetLineasInventario,
    Inventario,
    ItemInventario,
    LineaInventario,
    LineaSaltadaRegularizacion,
    MovistockRegularizacion,
    PatchCerrarInventario,
    PatchRegularizarInventario,
    PatchRestoACeroInventario,
    PostImportarCsvInventario,
    PostInventario,
    PostInventarioTotal,
    PostLineaInventario,
    ResultadoCerrarInventario,
    ResultadoImportarCsvInventario,
    ResultadoInventarioTotal,
    ResultadoRegularizacionInventario,
    ResultadoRestoACeroInventario,
} from "./diseño.ts";

const baseUrl = new ApiUrls().INVENTARIO;

interface InventarioApi {
    id: string;
    almacen_id: string;
    fecha: string;
    hora: string | null;
    observaciones: string | null;
    cerrado?: boolean;
}

interface LineaInventarioApi {
    id: number;
    inventario_id: string;
    stock_id: number;
    referencia: string;
    descripcion: string | null;
    cantidad_ini: number;
    cantidad_fin: number;
    codlote?: string | null;
}

interface ResultadoImportarCsvApi {
    inventario_id: string;
    lecturas_importadas: number;
    lineas_actualizadas: number;
}

interface ResultadoRestoACeroApi {
    inventario_id: string;
    lineas_creadas: number;
    saltados_por_lotes: number;
}

interface ResultadoInventarioTotalApi {
    inventario_id: string;
    lineas_creadas: number;
    saltados_por_lotes: number;
}

interface MovistockRegularizacionApi {
    movistock_id: string;
    stock_id: string;
    referencia: string;
    delta: number;
    cantidad_ini: number;
    cantidad_fin: number;
}

interface LineaSaltadaApi {
    stock_id: string;
    referencia: string;
    motivo: string;
}

interface ResultadoRegularizacionApi {
    inventario_id: string;
    movistocks: MovistockRegularizacionApi[];
    saltados: LineaSaltadaApi[];
}

const fechaDesdeApi = (fecha: string): Date => new Date(`${fecha}T12:00:00`);

const fechaAApi = (fecha: Date): string => fecha.toISOString().slice(0, 10);

export const inventarioDesdeApi = (api: InventarioApi): Inventario => ({
    id: api.id,
    almacenId: api.almacen_id,
    fecha: fechaDesdeApi(api.fecha),
    hora: api.hora,
    observaciones: api.observaciones ?? "",
    cerrado: api.cerrado ?? false,
});

export const itemInventarioDesdeApi = (api: InventarioApi): ItemInventario => ({
    id: api.id,
    almacenId: api.almacen_id,
    fecha: fechaDesdeApi(api.fecha),
    observaciones: api.observaciones ?? "",
    cerrado: api.cerrado ?? false,
});

export const lineaInventarioDesdeApi = (api: LineaInventarioApi): LineaInventario => ({
    id: String(api.id),
    inventarioId: api.inventario_id,
    stockId: api.stock_id,
    referencia: api.referencia,
    descripcion: api.descripcion ?? "",
    cantidadIni: api.cantidad_ini,
    cantidadFin: api.cantidad_fin,
    codlote: api.codlote ?? null,
});

export const resultadoImportarCsvDesdeApi = (
    api: ResultadoImportarCsvApi
): ResultadoImportarCsvInventario => ({
    inventarioId: api.inventario_id,
    lecturasImportadas: api.lecturas_importadas,
    lineasActualizadas: api.lineas_actualizadas,
});

export const resultadoRestoACeroDesdeApi = (
    api: ResultadoRestoACeroApi
): ResultadoRestoACeroInventario => ({
    inventarioId: api.inventario_id,
    lineasCreadas: api.lineas_creadas,
    saltadosPorLotes: api.saltados_por_lotes,
});

export const resultadoInventarioTotalDesdeApi = (
    api: ResultadoInventarioTotalApi
): ResultadoInventarioTotal => ({
    inventarioId: api.inventario_id,
    lineasCreadas: api.lineas_creadas,
    saltadosPorLotes: api.saltados_por_lotes,
});

const movistockDesdeApi = (api: MovistockRegularizacionApi): MovistockRegularizacion => ({
    movistockId: api.movistock_id,
    stockId: api.stock_id,
    referencia: api.referencia,
    delta: api.delta,
    cantidadIni: api.cantidad_ini,
    cantidadFin: api.cantidad_fin,
});

const saltadoDesdeApi = (api: LineaSaltadaApi): LineaSaltadaRegularizacion => ({
    stockId: api.stock_id,
    referencia: api.referencia,
    motivo: api.motivo,
});

const resultadoRegularizacionDesdeApi = (
    api: ResultadoRegularizacionApi
): ResultadoRegularizacionInventario => ({
    inventarioId: api.inventario_id,
    movistocks: api.movistocks.map(movistockDesdeApi),
    saltados: api.saltados.map(saltadoDesdeApi),
});

export const getInventario: GetInventario = async (id) =>
    RestAPI.getItem<Inventario, InventarioApi>(`${baseUrl}/${id}`, inventarioDesdeApi);

export const getInventarios: GetInventarios = async (criteria) =>
    RestAPI.getQuery<ItemInventario, InventarioApi>(baseUrl, criteria, itemInventarioDesdeApi);

export const getLineasInventario: GetLineasInventario = async (inventarioId) => {
    const respuesta = await RestAPI.get<{ datos: LineaInventarioApi[] }>(
        `${baseUrl}/${inventarioId}/linea`,
        "Error al obtener líneas de inventario"
    );
    return respuesta.datos.map(lineaInventarioDesdeApi);
};

export const postInventario: PostInventario = async (nuevo) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        {
            id: nuevo.id,
            almacen_id: nuevo.almacenId,
            fecha: fechaAApi(nuevo.fecha),
            observaciones: nuevo.observaciones || null,
        },
        "Error al crear inventario"
    );
    return respuesta.id;
};

export const postLineaInventario: PostLineaInventario = async (inventarioId, linea) => {
    const body: Record<string, unknown> = {
        referencia: linea.referencia,
        cantidad_fin: linea.cantidadFin,
    };
    if (linea.codlote.trim()) {
        body.codlote = linea.codlote.trim();
    }
    const respuesta = await RestAPI.post(
        `${baseUrl}/${inventarioId}/linea`,
        body,
        "Error al añadir línea de inventario"
    );
    return String(respuesta.id);
};

const respuestaDirecta = <TApi, T>(api: TApi | { datos: TApi }, map: (a: TApi) => T): T => {
    const datos = api && typeof api === "object" && "datos" in api ? api.datos : api;
    return map(datos as TApi);
};

export const patchCerrarInventario: PatchCerrarInventario = async (inventarioId) => {
    const respuesta = (await RestAPI.patch(
        `${baseUrl}/${inventarioId}/cerrar`,
        {},
        "Error al cerrar inventario"
    )) as unknown as ResultadoCerrarInventario | { datos: ResultadoCerrarInventario };
    return respuestaDirecta(respuesta, (d) => d);
};

export const patchRestoACeroInventario: PatchRestoACeroInventario = async (inventarioId) => {
    const respuesta = (await RestAPI.patch(
        `${baseUrl}/${inventarioId}/resto_a_cero`,
        {},
        "Error al añadir resto a cero"
    )) as unknown as ResultadoRestoACeroApi | { datos: ResultadoRestoACeroApi };
    return respuestaDirecta(respuesta, resultadoRestoACeroDesdeApi);
};

export const postImportarCsvInventario: PostImportarCsvInventario = async (
    inventarioId,
    contenido,
    opciones = {}
) => {
    const respuesta = (await RestAPI.post(
        `${baseUrl}/${inventarioId}/importar_csv`,
        {
            contenido,
            separador: opciones.separador ?? "|",
            ignorar_primera_linea: opciones.ignorarPrimeraLinea ?? false,
            col_referencia: opciones.colReferencia ?? 0,
            col_cantidad: opciones.colCantidad ?? 1,
        },
        "Error al importar CSV de inventario"
    )) as unknown as ResultadoImportarCsvApi;
    return resultadoImportarCsvDesdeApi(respuesta);
};

export const postInventarioTotal: PostInventarioTotal = async (nuevo) => {
    const respuesta = (await RestAPI.post(
        `${baseUrl}/inventario_total`,
        {
            id: nuevo.id,
            almacen_id: nuevo.almacenId,
            fecha: fechaAApi(nuevo.fecha),
            observaciones: nuevo.observaciones || null,
        },
        "Error al crear inventario total"
    )) as unknown as ResultadoInventarioTotalApi;
    return resultadoInventarioTotalDesdeApi(respuesta);
};

export const getExportLineasInventarioCsv: GetExportLineasInventarioCsv = async (inventarioId) =>
    RestAPI.blob(`${baseUrl}/${inventarioId}/linea.csv`, "Error al exportar líneas de inventario");

export const descargarBlobComoFichero = (blob: Blob, nombreFichero: string): void => {
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombreFichero;
    enlace.click();
    URL.revokeObjectURL(url);
};

export const patchRegularizarInventario: PatchRegularizarInventario = async (inventarioId) => {
    const respuesta = (await RestAPI.patch(
        `${baseUrl}/${inventarioId}/regularizar`,
        {},
        "Error al regularizar inventario"
    )) as unknown as ResultadoRegularizacionApi | { datos: ResultadoRegularizacionApi };

    const datos = "datos" in respuesta ? respuesta.datos : respuesta;
    return resultadoRegularizacionDesdeApi(datos);
};
