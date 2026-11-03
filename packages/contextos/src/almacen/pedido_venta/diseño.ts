import { Entidad, Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";

export type DisponibilidadPedido = 'total' | 'parcial' | 'sin_stock' | 'en_salida' | 'parcial_salida';

export interface ItemPedidoVenta extends Entidad {
    id: string;
    fecha: Date;
    cliente: string;
    codigo: string;
    disponibilidad?: DisponibilidadPedido;
}

export interface LineaPedidoVenta extends Entidad {
    id: string;
    referencia: string;
    descripcion: string;
    cantidad: number;
    pvpUnitario: number;
    pvpTotal: number;
    servida: number;
    cerrada: boolean;
}

export interface PedidoVenta extends ItemPedidoVenta {
    observaciones: string;
    lineas: LineaPedidoVenta[];
}

export type GetPedidosVenta = (filtro: Filtro, orden: Orden, paginacion?: Paginacion) => RespuestaLista<ItemPedidoVenta>;

export type GetPedidoVenta = (id: string) => Promise<PedidoVenta>;

export type GenerarSalidaDesdePedidos = (pedidoIds: number[], ubicacionDestinoId: number) => Promise<void>;

export type GenerarSalidaVentaDesdePedidos = (pedidoIds: number[], zonas: number[]) => Promise<string>;

export type ComprobarReservas = (
    zonas: number[],
    limite: number,
) => Promise<{ pedido_id: number; estado: DisponibilidadPedido }[]>;
