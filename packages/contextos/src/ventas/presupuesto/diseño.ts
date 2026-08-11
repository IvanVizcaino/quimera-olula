import { Entidad, Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { CambioClienteVenta, ClienteVenta, NuevaLineaVenta, Venta } from "../venta/diseño.ts";

export interface Presupuesto extends Venta {
  cliente: ClienteVenta;
  fecha_salida: Date;
  aprobado: boolean;
  lineas: LineaPresupuesto[];
}

export type NuevoPresupuesto = {
  cliente: {
    cliente_id: string;
    direccion_id: string;
  };
  empresa_id: string;
  oportunidad_id?: string | null;
}

export type NuevoPresupuestoClienteNoRegistrado = {
  empresa_id: string;
  // Campos para cliente no registrado
  nombre_cliente: string;
  id_fiscal: string;
  // Campos de dirección no registrada
  nombre_via: string;
  tipo_via?: string;
  numero?: string;
  otros?: string;
  cod_postal?: string;
  ciudad?: string;
  provincia_id?: number | null;
  provincia?: string;
  pais_id?: string;
  apartado?: string;
  telefono?: string;
};

export type CambioClientePresupuesto = CambioClienteVenta;

export interface LineaPresupuesto extends Entidad {
  id: string;
  referencia: string;
  descripcion: string;
  cantidad: number;
  pvp_unitario: number;
  dto_porcentual: number;
  pvp_total: number;
  grupo_iva_producto_id: string;
};

export type NuevaLinea = NuevaLineaVenta

export type Cliente = {
  cliente_id: string;
  direccion_id: string;
}

export const esClienteRegistrado = (presupuesto: NuevoPresupuesto | NuevoPresupuestoClienteNoRegistrado): presupuesto is NuevoPresupuesto => {
  return 'cliente_id' in presupuesto && 'direccion_id' in presupuesto;
};

export type GetPresupuestos = (filtro: Filtro, orden: Orden, paginacion: Paginacion) => RespuestaLista<Presupuesto>;

export type GetPresupuesto = (id: string) => Promise<Presupuesto>;

export type PostPresupuesto = (presupuesto: NuevoPresupuesto | NuevoPresupuestoClienteNoRegistrado) => Promise<string>;

export type CambiarArticuloLinea = (id: string, lineaId: string, referencia: string) => Promise<void>;

export type PatchLinea = (id: string, linea: LineaPresupuesto) => Promise<void>;

export type CambiarCantidadLinea = (id: string, linea: LineaPresupuesto, cantidad: number) => Promise<void>;

export type PostLinea = (id: string, linea: NuevaLinea) => Promise<string>;

export type DeleteLinea = (id: string, lineaId: string) => Promise<void>;

export type PatchCambiarDivisa = (id: string, divisaId: string) => Promise<void>;

export type PatchPresupuesto = (id: string, presupuesto: Presupuesto) => Promise<void>;


export type EstadoMaestroPresupuesto = (
  'INICIAL' | 'CREANDO_PRESUPUESTO'
);


export type ContextoMaestroPresupuesto = {
  estado: EstadoMaestroPresupuesto;
  presupuestos: ListaActivaEntidades<Presupuesto>;
};

export type EstadoPresupuesto = (
  'INICIAL' | 'ABIERTO' | 'APROBADO'
  | 'BORRANDO_PRESUPUESTO'
  | 'APROBANDO_PRESUPUESTO'
  | 'CAMBIANDO_DIVISA'
  | 'CAMBIANDO_CLIENTE'
  | 'CAMBIANDO_DESCUENTO'
  | 'CREANDO_LINEA' | 'BORRANDO_LINEA' | 'CAMBIANDO_LINEA'
);

export type ContextoPresupuesto = {
  estado: EstadoPresupuesto;
  presupuesto: Presupuesto;
  presupuestoInicial: Presupuesto;
  lineaActiva: LineaPresupuesto | null;
};