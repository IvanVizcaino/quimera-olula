import { Entidad, Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";

export type EstadoActividadUbicacion = "ACTIVA" | "BLOQUEADA";
export type CaraUbicacion = "IZQUIERDA" | "DERECHA";

export interface Ubicacion extends Entidad {
    id: string;
    codigo: string;
    idZona: string;
    zona: string;
    pasilloId: string | null;
    pasillo: string | null;
    modulo: number | null;
    /** Solo lectura: deducida del módulo (impar izquierda, par derecha). */
    cara: CaraUbicacion | null;
    nivel: number | null;
    hueco: number | null;
    tipoUbicacionId: string | null;
    tipoUbicacion: string | null;
    estado: EstadoActividadUbicacion;
}

/** Alta: si se indica pasillo, el código puede quedar vacío (lo genera el servidor). */
export type NuevaUbicacion = {
    codigo: string;
    zonaId: string;
    pasilloId: string | null;
    modulo: number | null;
    nivel: number | null;
    hueco: number | null;
    tipoUbicacionId: string | null;
};



export interface StockUbicacionItem extends Entidad {
    id: string;
    stockId: string;
    ubicacionId: string;
    ubicacion: string;
    articulo: string;
    articuloId: string;
    cantidadFisica: number;
}

export interface MoviStockUbicacion extends Entidad {
    id: string;
    cantidad: number;
    fechaHora: Date;
    idLote: string;
    lote: string
    idCaja: string | null;
    caja: string | null
    concepto: string
}

export interface StockUbicacion extends StockUbicacionItem {
    movimientos: MoviStockUbicacion[]
}


export type GetUbicacion = (id: string) => Promise<Ubicacion>;
export type GetUbicaciones = (
    filtro: Filtro,
    orden: Orden,
    paginacion?: Paginacion
) => RespuestaLista<Ubicacion>;

export type PostUbicacion = (ubicacion: NuevaUbicacion) => Promise<string>;
export type PatchUbicacion = (id: string, ubicacion: Partial<Ubicacion>) => Promise<void>;
export type DeleteUbicacion = (id: string) => Promise<void>;
export type GetStocksUbicacion = (ubicacionId: string) => Promise<StockUbicacionItem[]>;
export type GetStockUbicacion = (stockUbicacionId: string) => Promise<StockUbicacion>;

/** Saldo de stock en la ubicación por caja y lote (solo movimientos HECHO, saldo != 0). */
export interface DesgloseCajaStockUbicacion {
    idCaja: string | null;
    caja: string | null;
    idLote: string | null;
    cantidad: number;
}

export type GetDesgloseCajaStockUbicacion = (stockUbicacionId: string) => Promise<DesgloseCajaStockUbicacion[]>;


