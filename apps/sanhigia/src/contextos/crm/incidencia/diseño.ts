import { Entidad, Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";
// import { Accion } from "../accion/diseño.ts";

export type PrioridadIncidencia = 'Baja' | 'Media' | 'Alta';
export type EstadoIncidencia = 'Pendiente' | 'Nueva' | 'Pendiente de datos' | 'Asignada' | 'Rechazada' | 'Cerrada';
export type TipoIncidencia = 'Proveedor' | 'Transportista';
export type CategoriaIncidencia = 'INCIDT' | 'TRANSM' | 'CalidadProveedor' | 'INCI PTA' | 'Piezasaveria' | 'INCIDC';

export interface Incidencia extends Entidad {
    id: string;
    descripcion: string;
    observaciones: string;
    clienteId: string;
    facturaId?: string;
    codigoFactura?: string;
    nombreCliente: string;
    nombreCausante: string;
    prioridad: PrioridadIncidencia;
    estado: EstadoIncidencia;
    tipoIncidencia: TipoIncidencia;
    fecha: Date
    articuloId?: string;
    presupuestoId?: string;
    codigoPresupuesto?: string;
    enGarantia?: boolean;
    categoriaIncidencia: CategoriaIncidencia;
    subCategoriaIncidencia: string;
    agenteId: string;
}

export type GetIncidencia = (id: string) => Promise<Incidencia>;

export type GetIncidencias = (
    filtro: Filtro,
    orden: Orden,
    paginacion: Paginacion
) => RespuestaLista<Incidencia>;

// export type GetAccionesIncidencia = (id: string) => Promise<Accion[]>;

export type PostIncidencia = (incidencia: Partial<Incidencia>) => Promise<string>;
export type PatchIncidencia = (id: string, incidencia: Partial<Incidencia>) => Promise<void>;
export type DeleteIncidencia = (id: string) => Promise<void>;
export type CrearPresupuestoIncidencia = (incidencia: Incidencia) => Promise<string>;