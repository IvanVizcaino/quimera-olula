import { CategoriaIncidencia, EstadoIncidencia, PrioridadIncidencia, TipoIncidencia } from "../diseño.ts";

export type NuevaIncidencia = {
    descripcion: string;
    observaciones: string;
    clienteId: string;
    nombreCliente: string;
    tipoIncidencia?: TipoIncidencia;
    prioridad: PrioridadIncidencia;
    estado: EstadoIncidencia;
    fecha: Date;
    facturaId?: string;
    codigoFactura?: string;
    articuloId?: string;
    categoriaIncidencia: CategoriaIncidencia;
    subCategoriaIncidencia?: string;
};