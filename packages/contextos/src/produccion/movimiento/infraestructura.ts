import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { GetMovimientosOrden, MovimientoProduccion } from "./diseño.ts";

export interface MovimientoApi {
    id: string | number;
    tipo: string;
    proceso_id: string | number;
    orden_id: string | null;
    articulo_id: string;
    articulo: string | null;
    almacen_id: string | null;
    cantidad: number | string | null;
    estado: string | null;
    lote_id: string | null;
    lote_producido_id: string | null;
    componente_id: string | number | null;
    tarea_proceso_id: string | number | null;
    tarea_id: string | null;
    fecha_prevista: string | null;
    fecha_real: string | null;
}

const texto = (valor: string | number | null | undefined): string =>
    valor === null || valor === undefined ? "" : String(valor);

export const movimientoDesdeApi = (api: MovimientoApi): MovimientoProduccion => ({
    id: texto(api.id),
    tipo: api.tipo,
    procesoId: texto(api.proceso_id),
    ordenId: texto(api.orden_id),
    articuloId: texto(api.articulo_id),
    articulo: texto(api.articulo),
    almacenId: texto(api.almacen_id),
    cantidad: Number(api.cantidad ?? 0) || 0,
    estado: texto(api.estado),
    loteId: texto(api.lote_id),
    loteProducidoId: texto(api.lote_producido_id),
    componenteId: texto(api.componente_id),
    tareaProcesoId: texto(api.tarea_proceso_id),
    tareaId: texto(api.tarea_id),
    fechaPrevista: texto(api.fecha_prevista).slice(0, 10),
    fechaReal: texto(api.fecha_real).slice(0, 10),
});

export const getMovimientosOrden: GetMovimientosOrden = async (ordenId) => {
    const respuesta = await RestAPI.get<{ datos: MovimientoApi[] }>(
        `/produccion/movimiento/orden/${encodeURIComponent(ordenId)}`, "Error al leer los movimientos de la orden");
    return (respuesta.datos ?? []).map(movimientoDesdeApi);
};
