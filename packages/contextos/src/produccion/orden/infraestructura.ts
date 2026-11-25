import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import { AccionesCicloVida, getAccionesCicloVida } from "../comun/ciclo_vida.ts";
import {
    CambiosLoteOrden,
    CambiosOrden,
    DeleteLoteOrden,
    DeleteOrden,
    EstadoOrden,
    FormLoteOrden,
    GetOrden,
    GetOrdenes,
    LoteOrden,
    NuevaOrden,
    OrdenProduccion,
    PatchLoteOrden,
    PatchOrden,
    PostLoteOrden,
    PostLanzarOrden,
    PostOrden,
    PostSacarProcesoOrden,
    PostTerminarOrden,
    ReservaLote,
} from "./diseño.ts";
import { TareaApi, tareaDesdeApi } from "../tarea/infraestructura.ts";
import { AGREGADO_ORDEN, cantidadDesdeTexto } from "./dominio.ts";

const baseUrl = `/produccion/orden`;

export interface ReservaLoteApi {
    linea_pedido_id: string | number;
    pedido_id?: string | null;
    cantidad: number | null;
}

export interface LoteOrdenApi {
    id: string;
    articulo_id: string;
    descripcion?: string | null;
    cantidad: number | null;
    cantidad_programada: number | null;
    cantidad_total?: number | null;
    estado: string | null;
    fecha_fabricacion: string | null;
    cliente_id: string | null;
    linea_pedido_id: string | number | null;
    reservas?: ReservaLoteApi[];
}

export interface OrdenApi {
    id: string;
    fecha: string | null;
    fecha_entrega: string | null;
    estado: string | null;
    lanzada?: boolean | null;
    descripcion: string | null;
    observaciones?: string | null;
    pedido_id: string | null;
    cliente_id: string | null;
    cliente?: string | null;
    total_lotes: number | null;
    total_uds: number | null;
    lotes?: LoteOrdenApi[];
    tareas?: TareaApi[];
}

const fecha = (valor: string | null | undefined): string => (valor ? valor.slice(0, 10) : "");
const numero = (valor: number | string | null | undefined): number => Number(valor ?? 0) || 0;

export const reservaLoteDesdeApi = (api: ReservaLoteApi): ReservaLote => ({
    lineaPedidoId: String(api.linea_pedido_id),
    pedidoId: api.pedido_id ?? "",
    cantidad: numero(api.cantidad),
});

export const loteOrdenDesdeApi = (api: LoteOrdenApi): LoteOrden => ({
    id: api.id,
    articuloId: api.articulo_id,
    descripcion: api.descripcion ?? "",
    cantidad: numero(api.cantidad),
    cantidadProgramada: numero(api.cantidad_programada),
    cantidadTotal: numero(api.cantidad_total),
    estado: api.estado ?? "",
    fechaFabricacion: fecha(api.fecha_fabricacion),
    clienteId: api.cliente_id ?? "",
    lineaPedidoId: api.linea_pedido_id === null || api.linea_pedido_id === undefined ? "" : String(api.linea_pedido_id),
    reservas: (api.reservas ?? []).map(reservaLoteDesdeApi),
});

export const ordenDesdeApi = (api: OrdenApi): OrdenProduccion => ({
    id: api.id,
    fecha: fecha(api.fecha),
    fechaEntrega: fecha(api.fecha_entrega),
    estado: (api.estado || "PTE") as EstadoOrden,
    lanzada: !!api.lanzada,
    descripcion: api.descripcion ?? "",
    observaciones: api.observaciones ?? "",
    pedidoId: api.pedido_id ?? "",
    clienteId: api.cliente_id ?? "",
    cliente: api.cliente ?? "",
    totalLotes: numero(api.total_lotes),
    totalUds: numero(api.total_uds),
    lotes: (api.lotes ?? []).map(loteOrdenDesdeApi),
    tareas: (api.tareas ?? []).map(tareaDesdeApi),
});

type CambiosOrdenApi = {
    fecha?: string;
    fecha_entrega?: string | null;
    descripcion?: string | null;
    observaciones?: string | null;
    pedido_id?: string | null;
    cliente_id?: string | null;
};

const textoONull = (valor: string | null | undefined): string | null => (valor && valor.trim() ? valor.trim() : null);

/** Solo los campos presentes (el ciclo de vida mira cuáles cambian); vacío es `null`, salvo la fecha. */
export const cambiosOrdenAApi = (c: CambiosOrden): CambiosOrdenApi => {
    const api: CambiosOrdenApi = {};
    if (c.fecha !== undefined) api.fecha = c.fecha;
    if (c.fechaEntrega !== undefined) api.fecha_entrega = textoONull(c.fechaEntrega);
    if (c.descripcion !== undefined) api.descripcion = textoONull(c.descripcion);
    if (c.observaciones !== undefined) api.observaciones = textoONull(c.observaciones);
    if (c.pedidoId !== undefined) api.pedido_id = textoONull(c.pedidoId);
    if (c.clienteId !== undefined) api.cliente_id = textoONull(c.clienteId);
    return api;
};

/** Lote nuevo para la API: sin fecha de fabricación, la pone el servidor. */
export const loteAApi = (l: Pick<FormLoteOrden, "articuloId" | "cantidad" | "fechaFabricacion">) => ({
    articulo_id: l.articuloId.trim(),
    cantidad: cantidadDesdeTexto(l.cantidad),
    ...(textoONull(l.fechaFabricacion) ? { fecha_fabricacion: textoONull(l.fechaFabricacion) } : {}),
});

export const nuevaOrdenAApi = (n: NuevaOrden) => ({
    fecha: n.fecha,
    ...(textoONull(n.fechaEntrega) ? { fecha_entrega: textoONull(n.fechaEntrega) } : {}),
    ...(textoONull(n.descripcion) ? { descripcion: textoONull(n.descripcion) } : {}),
    lote: loteAApi(n),
});

export const cambiosLoteAApi = (c: CambiosLoteOrden): { cantidad?: number; fecha_fabricacion?: string | null } => {
    const api: { cantidad?: number; fecha_fabricacion?: string | null } = {};
    if (c.cantidad !== undefined) api.cantidad = c.cantidad;
    if (c.fechaFabricacion !== undefined) api.fecha_fabricacion = textoONull(c.fechaFabricacion);
    return api;
};

const url = (id: string) => `${baseUrl}/${encodeURIComponent(id)}`;
const urlLote = (id: string, loteId: string) => `${url(id)}/lote/${encodeURIComponent(loteId)}`;

export const getOrden: GetOrden = async (id) => RestAPI.getItem<OrdenProduccion, OrdenApi>(url(id), ordenDesdeApi);

export const getOrdenes: GetOrdenes = async (criteria: Criteria) =>
    RestAPI.getQuery<OrdenProduccion, OrdenApi>(baseUrl, criteria, ordenDesdeApi);

export const getAccionesOrden = (id: string): Promise<AccionesCicloVida> => getAccionesCicloVida(AGREGADO_ORDEN, id);

export const postOrden: PostOrden = async (nueva) => {
    const respuesta = await RestAPI.post(baseUrl, nuevaOrdenAApi(nueva), "Error al crear la orden de producción");
    return respuesta.id;
};

export const patchOrden: PatchOrden = async (id, cambios) => {
    await RestAPI.patch(url(id), cambiosOrdenAApi(cambios), "Error al guardar la orden de producción");
};

export const deleteOrden: DeleteOrden = async (id) => {
    await RestAPI.delete(url(id), "Error al borrar la orden de producción");
};

export const postLoteOrden: PostLoteOrden = async (id, lote) => {
    await RestAPI.post(`${url(id)}/lote`, loteAApi(lote), "Error al añadir el lote");
};

export const patchLoteOrden: PatchLoteOrden = async (id, loteId, cambios) => {
    await RestAPI.patch(urlLote(id, loteId), cambiosLoteAApi(cambios), "Error al cambiar el lote");
};

export const deleteLoteOrden: DeleteLoteOrden = async (id, loteId) => {
    await RestAPI.delete(urlLote(id, loteId), "Error al quitar el lote");
};

export const postLanzarOrden: PostLanzarOrden = async (id) => {
    await RestAPI.post(`${url(id)}/lanzar`, {}, "Error al lanzar la orden de producción");
};

/** Cuerpo de «Terminar orden»: el trabajador solo si se indica. */
export const terminarOrdenAApi = (trabajadorId?: string): { trabajador_id?: string } =>
    trabajadorId && trabajadorId.trim() ? { trabajador_id: trabajadorId.trim() } : {};

export const postTerminarOrden: PostTerminarOrden = async (id, trabajadorId) => {
    await RestAPI.post(`${url(id)}/terminar`, terminarOrdenAApi(trabajadorId), "Error al terminar la orden de producción");
};

export const postSacarProcesoOrden: PostSacarProcesoOrden = async (id) => {
    await RestAPI.post(`${url(id)}/sacar_proceso`, {}, "Error al sacar el proceso de la orden");
};
