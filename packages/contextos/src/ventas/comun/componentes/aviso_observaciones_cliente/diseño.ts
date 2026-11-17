import { GetConfigVentas } from "#/ventas/config/diseño.ts";

/** Aviso con las observaciones del cliente elegido en un documento de venta. */
export interface AvisoObservacionesCliente {
  clienteId: string;
  observaciones: string;
}

/** Lo único que necesita el aviso del cliente: sus observaciones. */
export type GetObservacionesCliente = (
  clienteId: string
) => Promise<string | null | undefined>;

export interface DependenciasAvisoObservacionesCliente {
  getConfig: GetConfigVentas;
  getObservaciones: GetObservacionesCliente;
}
