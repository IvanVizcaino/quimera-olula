import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export type EstadoPlanProduccion = 'Abierto' | 'Cerrado';

/**
 * Entidad ligera para el maestro (listado de planes).
 * Las fechas son strings 'YYYY-MM-DD', tal como las devuelve la API.
 */
export interface ItemPlanProduccion extends Entidad {
    id: string;
    descripcion: string;
    fecha: string;
    fechaSolicitada: string | null;
    fechaProveedor: string | null;
    estado: EstadoPlanProduccion;
    cantidad: number;
}

/**
 * Cabecera editable del plan. Proveedor, almacén y fecha de entrega son el valor
 * común de todas las líneas (null si difieren o no hay líneas) y al guardarlos
 * se aplican a todas ellas.
 */
export interface CabeceraPlanProduccion extends ItemPlanProduccion {
    observaciones: string;
    proveedorId: string | null;
    nombreProveedor: string | null;
    almacenId: string | null;
    nombreAlmacen: string | null;
    fechaEntrega: string | null;
}

/** Una talla de la referencia de una línea, con su cantidad (0 si no se pidió). */
export interface TallaLinea {
    talla: string;
    descripcion: string;
    grupo: string;
    orden: number | null;
    barcode: string;
    color: string;
    cantidad: number;
}

/** Línea de la rejilla: una referencia con sus tallas. `id` es undefined si es nueva. */
export interface LineaPlanProduccion {
    id?: string;
    referencia: string;
    descripcion: string;
    proveedorId: string | null;
    nombreProveedor: string | null;
    almacenId: string | null;
    nombreAlmacen: string | null;
    fechaEntrega: string | null;
    tallas: TallaLinea[];
}

export type TallaArticulo = Omit<TallaLinea, 'cantidad'>;

/** Respuesta de `talla_articulo`: una referencia con todas sus tallas. */
export interface ArticuloTallas {
    referencia: string;
    descripcion: string;
    tallas: TallaArticulo[];
}

export interface PlanProduccion {
    cabecera: CabeceraPlanProduccion;
    lineas: LineaPlanProduccion[];
}

/** Destino común que heredan las líneas nuevas. */
export interface DestinoLineas {
    proveedorId: string | null;
    nombreProveedor: string | null;
    almacenId: string | null;
    nombreAlmacen: string | null;
    fechaEntrega: string | null;
}

export interface NuevoPlanProduccion extends Modelo {
    id: string;
    descripcion: string;
    fecha: string;
    fechaSolicitada: string;
    fechaProveedor: string;
}

export interface CambiosPlanProduccion {
    descripcion?: string;
    fecha?: string;
    fechaSolicitada?: string | null;
    fechaProveedor?: string | null;
    estado?: EstadoPlanProduccion;
    observaciones?: string;
    proveedorId?: string | null;
    almacenId?: string | null;
    fechaEntrega?: string | null;
}

export type GetPlanProduccion = (id: string) => Promise<PlanProduccion>;
export type GetPlanesProduccion = (criteria: Criteria) => RespuestaLista<ItemPlanProduccion>;
export type PostPlanProduccion = (nuevo: NuevoPlanProduccion) => Promise<string>;
export type PatchPlanProduccion = (id: string, cambios: CambiosPlanProduccion) => Promise<void>;
export type PatchLineasPlanProduccion = (id: string, lineas: LineaPlanProduccion[]) => Promise<void>;
export type DeletePlanProduccion = (id: string) => Promise<void>;
export type GetTallasArticulo = (referencias: string[]) => Promise<ArticuloTallas[]>;
