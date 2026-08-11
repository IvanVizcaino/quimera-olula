import { Entidad, Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";
import type { NuevoEstadoOportunidad } from "./crear/diseño.ts";

export interface EstadoOportunidad extends Entidad {
    id: string;
    estadobase: string;
    descripcion: string;
    probabilidad: number;
    valorDefecto: boolean;
};

export type CambiosEstadoOportunidad = Partial<EstadoOportunidad>;

export type GetEstadoOportunidad = (id: string) => Promise<EstadoOportunidad>;

export type GetEstadosOportunidad = (filtro: Filtro, orden: Orden, paginacion: Paginacion) => RespuestaLista<EstadoOportunidad>;

export type PostEstadoOportunidad = (estado: NuevoEstadoOportunidad) => Promise<string>;

export type PatchEstadoOportunidad = (id: string, cambios: CambiosEstadoOportunidad) => Promise<void>;

export type DeleteEstadoOportunidad = (id: string) => Promise<void>;