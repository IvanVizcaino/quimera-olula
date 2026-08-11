import { MetaTabla } from "@olula/componentes/index.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Entidad } from "@olula/lib/diseño.ts";

export interface DevolucionPedido extends Entidad {
    codigo: string;
    codCliente: string;
    nombrecliente: string;
    servido: string;
    estadopago: string;
    fecha: Date | null;
    total: number;
}

export interface LineaDevolucionPedido extends Entidad {
    referencia: string;
    codigo: string;
    descripcion: string;
    cantidad: number;
    cantidadOk: number;
    cantidadKo: number;
    cantidadDevolver: number;
    precio: number;
    total: number;
    codLote?: string;
    fechaCaducidad?: Date | null;
    fechaCaducidadIso?: string;
    idLineaPc?: number;
}

export interface LineaFacturaDevolucion extends Entidad {
    referencia: string;
    descripcion: string;
    cantidad: number;
    precio: number;
    total: number;
    cantidadDevolver?: number;
    importe?: number;
    esKit?: boolean;
}

export interface CabeceraFacturaDevolucion extends Entidad {
    codigo: string;
    nombrecliente: string;
    codCliente?: string;
    fecha: Date | null;
    total: number;
}

export interface FacturaDevolucion {
    cabeceraFactura: CabeceraFacturaDevolucion;
    lineas: LineaFacturaDevolucion[];
}

export type CrearDevolucionPedidoPayload = {
    idFactura: string;
    idMotivo: string;
    razonDevolucion: string;
    lineasConDevoluciones: Array<{
        idlinea: string;
        referencia: string;
        descripcion: string;
        cantidad: number;
        esKit: boolean;
    }>;
};

export type PrepararDevolucionPedidoPayload = {
    idPedido: string;
    lineasDevolucion: LineaDevolucionPedido[];
};

export type DevolucionPedidoAPI = {
    idpedido: number | string;
    codigo: string;
    codcliente: string;
    nombrecliente: string;
    servido: string;
    sh_estadopago: string;
    fecha: string | null;
    total: number;
};

export type LineaDevolucionPedidoAPI = {
    id: number | string;
    idlineapc?: number;
    referencia?: string;
    codigo?: string;
    descripcion?: string;
    cantidad?: number;
    cantidad_factura?: number;
    cantidadok?: number;
    cantidadko?: number;
    cantidad_devolver?: number;
    codlote?: string;
    fechacaducidad?: string | null;
    precio?: number;
    total?: number;
};

export type LineaFacturaDevolucionAPI = {
    id?: number | string;
    idlinea?: number | string;
    referencia?: string;
    codigo?: string;
    descripcion?: string;
    cantidad?: number;
    precio?: number;
    total?: number;
    importe?: number;
    esKit?: boolean;
    cantidadDevolver?: number;
    cantidad_devolver?: number;
};

export type FacturaDevolucionAPI = {
    cabeceraFactura: {
        id: number | string;
        codigo: string;
        nombrecliente: string;
        codcliente?: string;
        fecha: string | null;
        total: number;
    };
    lineas: LineaFacturaDevolucionAPI[];
};

export type RespuestaFacturaDevolucionAPI = {
    cabecera?: {
        id?: number | string;
        idfactura?: number | string;
        codigo?: string;
        nombre?: string;
        nombrecliente?: string;
        codcliente?: string;
        fecha?: string | null;
        total?: number;
    };
    lineas?: LineaFacturaDevolucionAPI[];
};

export type EstadoMaestroDevolucionesPedidos = "INICIAL" | "BUSCANDO_FACTURA";

export type ContextoMaestroDevolucionesPedidos = {
    estado: EstadoMaestroDevolucionesPedidos;
    devoluciones: ListaActivaEntidades<DevolucionPedido>;
};

export const metaTablaDevolucionesPedidos: MetaTabla<DevolucionPedido> = [
    { id: "codigo", cabecera: "Codigo" },
    { id: "nombrecliente", cabecera: "Cliente" },
    { id: "fecha", cabecera: "Fecha", tipo: "fecha" },
    { id: "servido", cabecera: "Servido" },
    { id: "estadopago", cabecera: "Estado" },
    { id: "total", cabecera: "Importe", tipo: "moneda" },
];
