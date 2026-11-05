import { ListaEntidades } from "@olula/lib/ListaEntidades.ts";
import { Factura, LineaFactura } from "../diseño.ts";

export type EstadoDetalleFactura =
    | 'INICIAL'
    | 'ABIERTO' | 'VIENDO_TRAZA'
    | 'BORRANDO'
    | 'REGISTRANDO'
    | 'CAMBIANDO_PROVEEDOR'
    | 'CAMBIANDO_DIVISA'
    | 'CAMBIANDO_RECTIFICATIVA'
    | 'CREANDO_LINEA'
    | 'CAMBIANDO_LINEA'
    | 'BORRANDO_LINEA';

export type ContextoDetalleFactura = {
    estado: EstadoDetalleFactura;
    factura: Factura;
    lineas: ListaEntidades<LineaFactura>;
};
