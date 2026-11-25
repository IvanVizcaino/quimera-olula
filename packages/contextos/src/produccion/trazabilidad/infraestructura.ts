import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    ClienteTrazado,
    ConsumoLote,
    DatosLoteTrazado,
    EntradasSalidasLote,
    GetEntradasSalidasLote,
    GetTrazabilidad,
    LoteTrazado,
    MovimientoLote,
    SentidoTrazabilidad,
    Trazabilidad,
} from "./diseño.ts";

type Valor = string | number | null | undefined;

export interface MovimientoLoteApi {
    id: Valor;
    lote_id: string | null;
    articulo_id: string | null;
    tipo: string;
    entrada: boolean | null;
    cantidad: number | string | null;
    fecha: string | null;
    hora: string | null;
    concepto: string | null;
    almacen_id: string | null;
    documento_id: Valor;
    codigo: string | null;
    tercero_id: string | null;
    tercero: string | null;
    proceso_id: Valor;
    orden_id: string | null;
    lote_producido_id: string | null;
    tarea_id: string | null;
}

export interface ConsumoLoteApi {
    id: Valor;
    lote_id: string | null;
    lote_producido_id: string;
    articulo_id: string | null;
    articulo: string | null;
    cantidad: number | string | null;
    fecha: string | null;
    tarea_id: string | null;
    tarea_proceso_id: Valor;
    tarea: string | null;
    tramo_id: Valor;
    proceso_id: Valor;
    orden_id: string | null;
}

export interface DatosLoteApi {
    lote_id: string;
    articulo_id: string | null;
    articulo: string | null;
    caducidad: string | null;
    orden_id: string | null;
    fecha_fabricacion: string | null;
    cliente_id: string | null;
}

export interface LoteTrazadoApi extends DatosLoteApi {
    nivel: number;
    existe: boolean;
    compras?: MovimientoLoteApi[];
    consumos?: ConsumoLoteApi[];
    ventas?: MovimientoLoteApi[];
    consumido_en?: ConsumoLoteApi[];
}

export interface TrazabilidadApi {
    lote_id: string;
    niveles: number;
    truncado: boolean;
    lotes: LoteTrazadoApi[];
    clientes?: { cliente_id: string | null; cliente: string | null; lotes: string[] }[];
}

export interface EntradasSalidasApi extends DatosLoteApi {
    entradas: number | string | null;
    salidas: number | string | null;
    saldo: number | string | null;
    movimientos: MovimientoLoteApi[];
}

const texto = (valor: Valor): string => (valor === null || valor === undefined ? "" : String(valor));
const numero = (valor: Valor): number => Number(valor ?? 0) || 0;
const fecha = (valor: string | null | undefined): string => texto(valor).slice(0, 10);

export const movimientoLoteDesdeApi = (api: MovimientoLoteApi): MovimientoLote => ({
    id: texto(api.id),
    loteId: texto(api.lote_id),
    articuloId: texto(api.articulo_id),
    tipo: api.tipo,
    entrada: api.entrada ?? numero(api.cantidad) > 0,
    cantidad: numero(api.cantidad),
    fecha: fecha(api.fecha),
    hora: texto(api.hora).slice(0, 5),
    concepto: texto(api.concepto),
    almacenId: texto(api.almacen_id),
    documentoId: texto(api.documento_id),
    codigo: texto(api.codigo),
    terceroId: texto(api.tercero_id),
    tercero: texto(api.tercero),
    procesoId: texto(api.proceso_id),
    ordenId: texto(api.orden_id),
    loteProducidoId: texto(api.lote_producido_id),
    tareaId: texto(api.tarea_id),
});

export const consumoLoteDesdeApi = (api: ConsumoLoteApi): ConsumoLote => ({
    id: texto(api.id),
    loteId: texto(api.lote_id),
    loteProducidoId: texto(api.lote_producido_id),
    articuloId: texto(api.articulo_id),
    articulo: texto(api.articulo),
    cantidad: numero(api.cantidad),
    fecha: fecha(api.fecha),
    tareaId: texto(api.tarea_id),
    tareaProcesoId: texto(api.tarea_proceso_id),
    tarea: texto(api.tarea),
    tramoId: texto(api.tramo_id),
    procesoId: texto(api.proceso_id),
    ordenId: texto(api.orden_id),
});

const datosLoteDesdeApi = (api: DatosLoteApi): DatosLoteTrazado => ({
    loteId: api.lote_id,
    articuloId: texto(api.articulo_id),
    articulo: texto(api.articulo),
    caducidad: fecha(api.caducidad),
    ordenId: texto(api.orden_id),
    fechaFabricacion: fecha(api.fecha_fabricacion),
    clienteId: texto(api.cliente_id),
});

export const loteTrazadoDesdeApi = (api: LoteTrazadoApi, sentido: SentidoTrazabilidad): LoteTrazado => ({
    ...datosLoteDesdeApi(api),
    nivel: api.nivel,
    existe: api.existe !== false,
    documentos: ((sentido === "atras" ? api.compras : api.ventas) ?? []).map(movimientoLoteDesdeApi),
    consumos: ((sentido === "atras" ? api.consumos : api.consumido_en) ?? []).map(consumoLoteDesdeApi),
});

export const trazabilidadDesdeApi = (api: TrazabilidadApi, sentido: SentidoTrazabilidad): Trazabilidad => ({
    sentido,
    loteId: api.lote_id,
    niveles: api.niveles,
    truncado: !!api.truncado,
    lotes: (api.lotes ?? []).map((l) => loteTrazadoDesdeApi(l, sentido)),
    clientes: (api.clientes ?? []).map((c): ClienteTrazado => ({
        clienteId: texto(c.cliente_id),
        cliente: texto(c.cliente),
        lotes: c.lotes ?? [],
    })),
});

export const entradasSalidasDesdeApi = (api: EntradasSalidasApi): EntradasSalidasLote => ({
    ...datosLoteDesdeApi(api),
    entradas: numero(api.entradas),
    salidas: numero(api.salidas),
    saldo: numero(api.saldo),
    movimientos: (api.movimientos ?? []).map(movimientoLoteDesdeApi),
});

const url = (loteId: string, ruta: string) =>
    `/produccion/trazabilidad/lote/${encodeURIComponent(loteId)}/${ruta}`;

export const getTrazabilidad: GetTrazabilidad = async (loteId, sentido) => {
    const respuesta = await RestAPI.get<{ datos: TrazabilidadApi }>(
        url(loteId, sentido), "Error al leer la trazabilidad del lote");
    return trazabilidadDesdeApi(respuesta.datos, sentido);
};

export const getEntradasSalidasLote: GetEntradasSalidasLote = async (loteId) => {
    const respuesta = await RestAPI.get<{ datos: EntradasSalidasApi }>(
        url(loteId, "movimientos"), "Error al leer las entradas y salidas del lote");
    return entradasSalidasDesdeApi(respuesta.datos);
};
