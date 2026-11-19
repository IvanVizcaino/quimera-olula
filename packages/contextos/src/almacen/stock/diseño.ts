import { Entidad, Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";


export interface StockItem extends Entidad {
    id: string;
    articulo: string;
    almacen: string;
    articuloId: string;
    almacenId: string;
    cantidadFisica: number;
    cantidadDisponible: number;
    cantidadReservada: number;
    cantidadPendiente: number;
    necesidad?: number | null;
    stockMinimo?: number | null;
    stockMaximo?: number | null;
    fechaUltimaRegularizacion?: string | null;
    horaUltimaRegularizacion?: string | null;
    cantidadUltimaRegularizacion?: number | null;
}

export interface StockUbicacion extends Entidad {
    id: string;
    idUbicacion: string;
    ubicacion: string;
    cantidad: number;
}

export interface Stock extends StockItem {
    ubicaciones: StockUbicacion[]
}

export interface StockAPI extends Entidad {
    id: string;
    articulo: string;
    almacen: string;
    articulo_id: string;
    almacen_id: string;
    cantidad_fisica: number;
    cantidad_disponible: number;
    cantidad_reservada: number;
    cantidad_pendiente: number;
    necesidad?: number | null;
    stock_minimo?: number | null;
    stock_maximo?: number | null;
    fecha_ultima_regularizacion?: string | null;
    hora_ultima_regularizacion?: string | null;
    cantidad_ultima_regularizacion?: number | null;
}

export type GetStock = (id: string) => Promise<Stock>;
export type GetStocks = (
    filtro: Filtro,
    orden: Orden,
    paginacion?: Paginacion
) => RespuestaLista<StockItem>;
