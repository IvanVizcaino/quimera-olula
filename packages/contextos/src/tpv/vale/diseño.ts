import { Criteria, Entidad, RespuestaLista } from "@olula/lib/diseño.js";

export interface ValeTpv extends Entidad {
    saldo_inicial: number;
    saldo_consumido: number;
    saldo_pendiente: number;
}

/** Vale emitido (devolución pagada con vale). Requiere plugin `vales_tpv`. */
export interface ValeEmitido extends Entidad {
    id: string;
    ventaId: string;
    fecha: string;
    hora: string;
    clienteId: string | null;
    nombreCliente: string | null;
    puntoVentaId: string | null;
    puntoVenta: string | null;
    saldoInicial: number;
    saldoConsumido: number;
    saldoPendiente: number;
    anulado: boolean;
}

export type GetValeTpv = (id: string) => Promise<ValeTpv>;
export type GetValesEmitidos = (criteria: Criteria) => RespuestaLista<ValeEmitido>;
