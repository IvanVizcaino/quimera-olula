import { CambioDivisa } from "#/ventas/comun/componentes/moleculas/CambiarDivisa/diseño.ts";
import { Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { CambioClienteVenta, ClienteVenta, LineaVenta, NuevaLineaVenta, NuevaVentaClienteNoRegistrado, Venta } from "../venta/diseño.ts";

/** Cuánto del presupuesto se ha llevado ya a pedidos. */
export type EstadoAprobado = "PENDIENTE" | "PARCIAL" | "TOTAL";

export interface Presupuesto extends Venta {
  cliente: ClienteVenta;
  fecha_salida: Date;
  estado_aprobado: EstadoAprobado;
  por_comision: number;
  almacen_id: string;
  lineas: LineaPresupuesto[];
  /** Plugin `marca_impresion`. */
  impreso?: boolean;
}

export type NuevoPresupuesto = {
  cliente_id: string;
  direccion_id: string;
  empresa_id: string;
  oportunidad_id?: string | null;
}

export type NuevoPresupuestoClienteNoRegistrado = NuevaVentaClienteNoRegistrado;

export type CambioClientePresupuesto = CambioClienteVenta;

export interface LineaPresupuesto extends LineaVenta {
  /** Cantidad ya llevada a pedidos; el pendiente es cantidad - aprobada. */
  aprobada: number;
  cerrada: boolean;
  otro_campo?: string;
};

export type NuevaLinea = NuevaLineaVenta

export type Cliente = {
  cliente_id: string;
  direccion_id: string;
}

export type GetPresupuestos = (filtro: Filtro, orden: Orden, paginacion: Paginacion) => RespuestaLista<Presupuesto>;

export type GetPresupuesto = (id: string) => Promise<Presupuesto>;

export type GetReportPresupuesto = (id: string) => Promise<Blob>;

export type PostPresupuesto = (presupuesto: NuevoPresupuesto | NuevoPresupuestoClienteNoRegistrado) => Promise<string>;

export type CambiarArticuloLinea = (id: string, lineaId: string, referencia: string) => Promise<void>;

export type PatchLinea = (id: string, linea: LineaPresupuesto) => Promise<void>;

export type CambiarCantidadLinea = (id: string, linea: LineaPresupuesto, cantidad: number) => Promise<void>;

export type PostLinea = <T extends NuevaLineaVenta>(id: string, linea: T) => Promise<T>;

export type QueryNuevaLinea = <T extends NuevaLineaVenta>(id: string, linea: T) => Promise<T>;

export type DeleteLinea = (id: string, lineaId: string) => Promise<void>;

export type PatchCambiarDivisa = (id: string, cambio: CambioDivisa) => Promise<void>;

export type PedidoCreado = {
  id: string;
  codigo: string;
};

export type PatchAprobarPresupuesto = (id: string) => Promise<PedidoCreado>;


export type EstadoMaestroPresupuesto = (
  'INICIAL' | 'CREANDO_PRESUPUESTO'
);


export type ContextoMaestroPresupuesto = {
  estado: EstadoMaestroPresupuesto;
  presupuestos: ListaActivaEntidades<Presupuesto>;
};

export type EstadoPresupuesto = (
  'INICIAL' | 'ABIERTO' | 'VIENDO_TRAZA' | 'APROBADO'
  | 'BORRANDO_PRESUPUESTO'
  | 'APROBANDO_PRESUPUESTO' | 'PEDIDO_CREADO'
  | 'CAMBIANDO_DIVISA'
  | 'CAMBIANDO_CLIENTE'
  | 'CAMBIANDO_DESCUENTO'
  | 'CAMBIANDO_AGENTE'
  | 'CREANDO_LINEA' | 'BORRANDO_LINEA' | 'CAMBIANDO_LINEA'
);

export type ContextoPresupuesto = {
  estado: EstadoPresupuesto;
  presupuesto: Presupuesto;
  presupuestoInicial: Presupuesto;
  lineaActiva: LineaPresupuesto | null;
  pedidoCreado: PedidoCreado | null;
};