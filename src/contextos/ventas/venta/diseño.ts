import { Direccion, Entidad } from "../../comun/diseño.ts";

export interface Venta extends Entidad {
    id: string;
    codigo: string;
    fecha: string;
    cliente_id: string;
    nombre_cliente: string;
    id_fiscal: string;
    direccion_id: string;
    direccion: Direccion;
    agente_id: string;
    nombre_agente: string;
    divisa_id: string;
    tasa_conversion: number;
    total: number;
    neto: number;
    total_iva: number;
    total_irpf: number;
    total_divisa_empresa: number;
    forma_pago_id: string;
    nombre_forma_pago: string;
    grupo_iva_negocio_id: string;
    observaciones: string;
}

export interface LineaVenta extends Entidad {
    id: string;
    referencia: string | null;
    descripcion: string;
    cantidad: number;
    pvp_unitario: number;
    dto_porcentual: number;
    pvp_total: number;
    grupo_iva_producto_id: string;
};

export type NuevaVenta = {
    cliente_id: string;
    direccion_id: string;
    empresa_id: string;
};

export type CambioClienteVenta = {
    cliente_id: string;
    nombre_cliente: string;
    direccion_id: string;
};

export type NuevaLineaVenta = {
    referencia: string;
    cantidad: number;
};


export type ClienteVenta = {
    cliente_id: string;
    direccion_id: string;
}

