import { Modelo } from "@olula/lib/diseño.ts";

export type AlbaranCreado = {
    id: string;
    codigo: string;
};

export interface LoteAlbaranar extends Modelo {
    idLote: string;
    cantidad: number;
}

export interface LineaAlbaranar extends Modelo {
    idLinea: string;
    sku: string;
    descripcion: string;
    pvpTotal: number;
    cantidad: number;
    servida: number;
    pendiente: number;
    enviada: number;
    cerrada: boolean;
    porLotes: boolean;
    lotes: LoteAlbaranar[];
}

export interface AlbaranarPedido extends Modelo {
    id: string;
    lineas: LineaAlbaranar[];
}

