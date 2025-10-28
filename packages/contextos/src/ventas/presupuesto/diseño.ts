import { Direccion, Entidad, Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";
import { NuevaLineaVenta } from "../venta/diseño.ts";

export interface Presupuesto extends Entidad {
  id: string;
  codigo: string;
  fecha: string;
  fecha_salida: string;
  cliente_id: string;
  nombre_cliente: string;
  id_fiscal: string;
  direccion_id: string;
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
  aprobado: boolean;
  observaciones: string;
  nombre_via: string;
  tipo_via: string;
  numero: string;
  otros: string;
  cod_postal: string;
  ciudad: string;
  provincia_id: number;
  provincia: string;
  pais_id: string;
  apartado: string;
  telefono: string;
}

export interface PresupuestoAPI {
  id: string;
  codigo: string;
  fecha: string;
  fecha_salida: string;
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
  aprobado: boolean;
  observaciones: string;
}

export type NuevoPresupuesto = {
  cliente_id: string;
  direccion_id: string;
  empresa_id: string;
};

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

export type CambioCliente = {
  cliente_id?: string;
  nombre_cliente?: string;
  direccion_id?: string;
  id_fiscal?: string;
  nombre_via?: string;
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

// export interface NuevaLinea extends Modelo {
//   referencia: string;
//   cantidad: number;
// };

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

