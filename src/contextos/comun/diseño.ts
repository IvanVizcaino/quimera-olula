export type Entidad = {
  id: string;
  [clave: string]: unknown;
};

export type EntidadAccion = {
  id: string;
}

type ValorFiltro = { LIKE: string };
export type Filtro = { [campo: string]: ValorFiltro };

/* eslint-disable  @typescript-eslint/no-explicit-any */
export type Acciones<T extends Entidad> = {
  obtenerUno: (id: string) => Promise<T | null>;
  obtenerTodos: (filtro?: Filtro) => Promise<T[]>;
  crearUno: (entidad: Partial<T>) => Promise<any>;
  actualizarUno: (id: string, entidad: any) => Promise<void>;
  actualizarUnElemento: (id: string, entidad: any, nombreAccion: string) => Promise<void>;
  eliminarUno: (id: string) => Promise<void>;
};
