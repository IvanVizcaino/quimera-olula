import { Entidad, Filtro, Modelo, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";

export type CarasPasillo = "AMBAS" | "IZQUIERDA" | "DERECHA";
/** Por dónde se entra: los dos extremos, solo el del módulo 1 (frente) o solo el del último (fondo). */
export type AccesosPasillo = "AMBOS_EXTREMOS" | "FRENTE" | "FONDO";

export interface Pasillo extends Entidad {
    id: string;
    zonaId: string;
    zona: string;
    codigo: string;
    orden: number;
    caras: CarasPasillo;
    modulos: number;
    accesos: AccesosPasillo;
}

/** Alta y cambio de un pasillo (la zona se indica aparte al crear). */
export interface NuevoPasillo extends Modelo {
    codigo: string;
    orden: number | null;
    caras: CarasPasillo;
    modulos: number | null;
    accesos: AccesosPasillo;
}

export interface ParametrosGenerarUbicaciones extends Modelo {
    nivelDesde: number | null;
    nivelHasta: number | null;
    huecosPorNivel: number | null;
    tipoUbicacionId: string | null;
    moduloDesde: number | null;
    moduloHasta: number | null;
}

export type ResultadoGenerarUbicaciones = {
    creadas: number;
    ids: string[];
};

export type GetPasillo = (id: string) => Promise<Pasillo>;
export type GetPasillos = (
    filtro: Filtro,
    orden: Orden,
    paginacion?: Paginacion
) => RespuestaLista<Pasillo>;
export type PostPasillo = (zonaId: string, nuevo: NuevoPasillo) => Promise<string>;
export type PatchPasillo = (id: string, cambios: Partial<NuevoPasillo>) => Promise<void>;
export type DeletePasillo = (id: string) => Promise<void>;
export type GenerarUbicacionesPasillo = (
    id: string,
    parametros: ParametrosGenerarUbicaciones
) => Promise<ResultadoGenerarUbicaciones>;
