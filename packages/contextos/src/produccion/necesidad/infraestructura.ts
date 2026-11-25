import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { OrdenApi, ordenDesdeApi } from "../orden/infraestructura.ts";
import {
    FilaGenerar,
    GetNecesidades,
    Necesidad,
    OrdenesGeneradas,
    OrigenNecesidad,
    PeticionGenerar,
    PostGenerarOrdenes,
    RespuestaNecesidades,
} from "./diseño.ts";
import { queryNecesidades } from "./dominio.ts";

export interface NecesidadApi {
    id: string;
    origen: string;
    pedido_id: string | null;
    linea_pedido_id: string | number | null;
    cliente_id: string | null;
    cliente: string | null;
    fecha_pedido: string | null;
    fecha_salida: string | null;
    articulo_id: string;
    descripcion: string | null;
    tipo_proceso_id: string | null;
    pendiente: number | null;
    cubierta: number | null;
    existencias: number | null;
    disponible: number | null;
    por_recibir: number | null;
    a_faltas: number | null;
    stock_minimo: number | null;
    stock_maximo: number | null;
    cantidad_necesaria: number | null;
    compuestos: string[] | null;
    cantidad: number | null;
    lotes: { lote_id: string; orden_id: string | null; cantidad: number | null }[] | null;
    ordenes_abiertas: string[] | null;
    avisos: string[] | null;
    lanzable: boolean | null;
}

export interface RespuestaNecesidadesApi {
    datos: NecesidadApi[];
    total: number;
    pedido_completo: boolean;
    almacen_id: string | null;
    a_faltas: boolean;
}

const numero = (valor: number | string | null | undefined): number => Number(valor ?? 0) || 0;
const numeroONull = (valor: number | null | undefined): number | null =>
    valor === null || valor === undefined ? null : numero(valor);
const fecha = (valor: string | null | undefined): string => (valor ? valor.slice(0, 10) : "");

export const necesidadDesdeApi = (api: NecesidadApi): Necesidad => ({
    id: api.id,
    origen: (["pedido", "stock", "componente"].includes(api.origen) ? api.origen : "stock") as OrigenNecesidad,
    pedidoId: api.pedido_id ?? "",
    lineaPedidoId: api.linea_pedido_id === null || api.linea_pedido_id === undefined ? "" : String(api.linea_pedido_id),
    clienteId: api.cliente_id ?? "",
    cliente: api.cliente ?? "",
    fechaPedido: fecha(api.fecha_pedido),
    fechaSalida: fecha(api.fecha_salida),
    articuloId: api.articulo_id,
    descripcion: api.descripcion ?? "",
    tipoProcesoId: api.tipo_proceso_id ?? "",
    pendiente: numeroONull(api.pendiente),
    cubierta: numero(api.cubierta),
    existencias: numero(api.existencias),
    disponible: numero(api.disponible),
    porRecibir: numero(api.por_recibir),
    aFaltas: numeroONull(api.a_faltas),
    stockMinimo: numero(api.stock_minimo),
    stockMaximo: numero(api.stock_maximo),
    cantidadNecesaria: numeroONull(api.cantidad_necesaria),
    compuestos: api.compuestos ?? [],
    cantidad: numero(api.cantidad),
    lotes: (api.lotes ?? []).map((l) => ({ loteId: l.lote_id, ordenId: l.orden_id ?? "", cantidad: numero(l.cantidad) })),
    ordenesAbiertas: api.ordenes_abiertas ?? [],
    avisos: api.avisos ?? [],
    lanzable: !!api.lanzable,
});

export const respuestaNecesidadesDesdeApi = (api: RespuestaNecesidadesApi): RespuestaNecesidades => ({
    datos: (api.datos ?? []).map(necesidadDesdeApi),
    total: numero(api.total),
    pedidoCompleto: !!api.pedido_completo,
    almacenId: api.almacen_id ?? "",
    aFaltas: !!api.a_faltas,
});

type FilaGenerarApi = { articulo_id: string; cantidad: number; linea_pedido_id?: string };

export const filaGenerarAApi = (f: FilaGenerar): FilaGenerarApi => ({
    articulo_id: f.articuloId,
    cantidad: f.cantidad,
    ...(f.lineaPedidoId ? { linea_pedido_id: f.lineaPedidoId } : {}),
});

export const peticionGenerarAApi = (p: PeticionGenerar) => ({
    filas: p.filas.map(filaGenerarAApi),
    lanzar: p.lanzar,
    ...(p.fechaFabricacion && p.fechaFabricacion.trim() ? { fecha_fabricacion: p.fechaFabricacion.trim() } : {}),
});

export interface OrdenesGeneradasApi {
    ordenes: OrdenApi[];
    procesos: unknown[];
}

export const ordenesGeneradasDesdeApi = (api: OrdenesGeneradasApi): OrdenesGeneradas => ({
    ordenes: (api.ordenes ?? []).map(ordenDesdeApi),
    procesos: (api.procesos ?? []).length,
});

export const getNecesidades: GetNecesidades = async (filtros) => {
    const api = await RestAPI.get<RespuestaNecesidadesApi>(
        `/produccion/necesidades${queryNecesidades(filtros)}`, "Error al buscar las necesidades de fabricación");
    return respuestaNecesidadesDesdeApi(api);
};

export const postGenerarOrdenes: PostGenerarOrdenes = async (peticion) => {
    const api = await RestAPI.query<ReturnType<typeof peticionGenerarAApi>, OrdenesGeneradasApi>(
        "/produccion/orden/generar", peticionGenerarAApi(peticion), "Error al generar las órdenes de producción");
    return ordenesGeneradasDesdeApi(api);
};
