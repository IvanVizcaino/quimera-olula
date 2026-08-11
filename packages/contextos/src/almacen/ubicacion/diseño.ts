import { Entidad, Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";

export interface Ubicacion extends Entidad {
    id: string;
    codigo: string;
    idZona: string;
    zona: string;
};



export interface StockUbicacion extends Entidad {
    id: string;
    stockId: string;
    ubicacionId: string;
    ubicacion: string;
    articulo: string;
    articuloId: string;
    cantidadFisica: number;
}

export interface StockUbicacionAPI {
    id: string;
    stock_id: string;
    ubicacion_id: string;
    ubicacion: string;
    articulo: string;
    articulo_id: string;
    cantidad_fisica: number;
}

export type GetUbicacion = (id: string) => Promise<Ubicacion>;
export type GetUbicaciones = (
    filtro: Filtro,
    orden: Orden,
    paginacion?: Paginacion
) => RespuestaLista<Ubicacion>;

export type PostUbicacion = (ubicacion: Partial<Ubicacion>) => Promise<string>;
export type PatchUbicacion = (id: string, ubicacion: Partial<Ubicacion>) => Promise<void>;
export type DeleteUbicacion = (id: string) => Promise<void>;
export type GetStocksUbicacion = (ubicacionId: string) => Promise<StockUbicacion[]>;


