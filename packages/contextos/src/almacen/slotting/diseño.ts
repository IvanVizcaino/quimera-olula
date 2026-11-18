export type ClaseAbc = "A" | "B" | "C";

export interface ArticuloAbc {
    articuloId: string;
    descripcion: string;
    lineas: number;
    unidades: number;
    porcentajeAcumulado: number;
    clase: ClaseAbc;
}

export interface UbicacionPropuesta {
    ubicacionId: string;
    ubicacion: string;
    zona: string;
    accesibilidad: number;
    claseUbicacion: ClaseAbc;
}

export interface PropuestaUbicacion {
    articuloId: string;
    clase: ClaseAbc;
    ubicaciones: UbicacionPropuesta[];
}

export type AccionRecolocacion = "INTERCAMBIAR" | "MOVER";

export interface Recolocacion {
    articuloId: string;
    clase: ClaseAbc;
    ubicacion: string;
    claseUbicacion: ClaseAbc;
    accion: AccionRecolocacion;
    conArticuloId: string | null;
    conUbicacion: string | null;
    beneficio: number;
}

/** De dónde sale la rotación: órdenes de salida del SGA o albaranes de venta. */
export type OrigenRotacion = "ORDENES" | "VENTAS";

export type GetAbc = (almacenId: string, dias: number, origen: OrigenRotacion) => Promise<ArticuloAbc[]>;
export type GetPropuesta = (
    almacenId: string, articuloId: string, limite: number, origen: OrigenRotacion
) => Promise<PropuestaUbicacion>;
export type GetRecolocacion = (
    almacenId: string, dias: number, limite: number, origen: OrigenRotacion
) => Promise<Recolocacion[]>;

/** Clases de artículo a las que asignar picking fijo: solo A o A y B. */
export type ClasesPicking = "A" | "AB";

export interface PropuestaPickingFijo {
    articuloId: string;
    descripcion: string;
    clase: ClaseAbc;
    lineas: number;
    unidades: number;
    ubicacionId: string | null;
    ubicacion: string | null;
    zona: string | null;
    accesibilidad: number | null;
    minimo: number;
    maximo: number;
    unidadReposicion: number;
}

export type EstadoFilaPicking = "PENDIENTE" | "CREADO" | "ERROR";

/** Fila editable de la propuesta de picking fijo. */
export interface FilaPickingFijo extends PropuestaPickingFijo {
    seleccionada: boolean;
    estado: EstadoFilaPicking;
    errorCreacion: string | null;
}

export type GetPropuestaPicking = (
    almacenId: string, dias: number, origen: OrigenRotacion, clases: ClasesPicking, cobertura: number,
    reposicion: number
) => Promise<PropuestaPickingFijo[]>;

/** Ajuste de la migración: positivo se ubica en la ubicación destino; negativo se retira de ella. */
export interface AjusteMigracion {
    stockId: string;
    articuloId: string;
    loteId: string | null;
    cantidad: number;
}

export interface ResultadoMigracion {
    simulado: boolean;
    lineasUbicadas: number;
    unidadesUbicadas: number;
    lineasRetiradas: number;
    unidadesRetiradas: number;
    ajustes: AjusteMigracion[];
}

export type UbicarSinUbicar = (
    almacenId: string, ubicacionId: string, simular: boolean
) => Promise<ResultadoMigracion>;
