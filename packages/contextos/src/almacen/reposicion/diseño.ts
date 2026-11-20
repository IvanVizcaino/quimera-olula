export interface OrigenReposicion {
    ubicacionId: string;
    ubicacion: string;
    cantidad: number;
}

export interface NecesidadReposicion {
    pickingFijoId: string;
    articuloId: string;
    descripcion: string;
    ubicacionId: string;
    ubicacion: string;
    minimo: number;
    maximo: number;
    unidadReposicion: number;
    fisico: number;
    entrante: number;
    saliente: number;
    disponible: number;
    cantidad: number;
    falta: number;
    origenes: OrigenReposicion[];
}

export interface Reposicion {
    ordenId: string | null;
    necesidades: NecesidadReposicion[];
}

/** `pickingFijoIds`: solo esas necesidades (por defecto, todas las del almacén). */
export type GenerarReposicion = (
    almacenId: string, simular: boolean, pickingFijoIds?: string[]
) => Promise<Reposicion>;
