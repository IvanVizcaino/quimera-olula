import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/** Estados de la orden (`pr_ordenesproduccion.estado`); los cambia el motor de procesos (F5). */
export type EstadoOrden = "PTE" | "EN CURSO" | "TERMINADA";

/** Lote de la orden (fila de `lotes` con `codordenproduccion`). Fechas "AAAA-MM-DD" o vacías. */
export interface LoteOrden extends Entidad {
    id: string;
    articuloId: string;
    descripcion: string;
    cantidad: number;
    cantidadProgramada: number;
    /** Lo fabricado hasta ahora (lo totaliza almacén con los movimientos). */
    cantidadTotal: number;
    estado: string;
    fechaFabricacion: string;
    clienteId: string;
    lineaPedidoId: string;
}

/** Tarea de la orden: la llenará el motor de procesos (F5); por ahora se muestra lo que venga. */
export interface TareaOrden extends Entidad {
    id: string;
    descripcion: string;
    estado: string;
    [campo: string]: unknown;
}

/**
 * Orden de producción (`pr_ordenesproduccion`). Las fechas van en "AAAA-MM-DD" y los campos
 * opcionales vacíos son "" (como los dejan los campos del formulario).
 */
export interface OrdenProduccion extends Entidad {
    id: string;
    fecha: string;
    fechaEntrega: string;
    estado: EstadoOrden;
    descripcion: string;
    observaciones: string;
    /** Código del pedido de cliente (`pedidoscli.codigo`). */
    pedidoId: string;
    clienteId: string;
    /** Nombre del cliente (solo lectura). */
    cliente: string;
    totalLotes: number;
    totalUds: number;
    /** Solo en el detalle. */
    lotes: LoteOrden[];
    tareas: TareaOrden[];
}

/** Lo que se cambia de la cabecera (solo los campos que cambian: el ciclo de vida mira cuáles van). */
export type CambiosOrden = Partial<Pick<OrdenProduccion,
    "fecha" | "fechaEntrega" | "descripcion" | "observaciones" | "pedidoId" | "clienteId">>;

/** Alta de una orden con su lote (una orden, un lote). */
export interface NuevaOrden extends Modelo {
    fecha: string;
    fechaEntrega: string;
    descripcion: string;
    articuloId: string;
    cantidad: number | string | null;
    /** Vacía: la pone el servidor (hoy + 20 días). */
    fechaFabricacion: string;
}

/** Formulario de añadir o cambiar el lote. Al cambiar, el artículo no se toca. */
export interface FormLoteOrden extends Modelo {
    articuloId: string;
    cantidad: number | string | null;
    fechaFabricacion: string;
}

export type CambiosLoteOrden = Partial<Pick<LoteOrden, "cantidad" | "fechaFabricacion">>;

export type GetOrden = (id: string) => Promise<OrdenProduccion>;
export type GetOrdenes = (criteria: Criteria) => RespuestaLista<OrdenProduccion>;
export type PostOrden = (nueva: NuevaOrden) => Promise<string>;
export type PatchOrden = (id: string, cambios: CambiosOrden) => Promise<void>;
export type DeleteOrden = (id: string) => Promise<void>;
export type PostLoteOrden = (id: string, lote: FormLoteOrden) => Promise<void>;
export type PatchLoteOrden = (id: string, loteId: string, cambios: CambiosLoteOrden) => Promise<void>;
export type DeleteLoteOrden = (id: string, loteId: string) => Promise<void>;
