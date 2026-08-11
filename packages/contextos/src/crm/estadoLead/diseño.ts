import { Entidad, Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";

export interface EstadoLead extends Entidad {
    id: string;
    descripcion: string;
    valorDefecto: boolean;
};

export type GetEstadoLead = (id: string) => Promise<EstadoLead>;

export type GetEstadosLead = (filtro: Filtro, orden: Orden, paginacion: Paginacion) => RespuestaLista<EstadoLead>;

export type PostEstadoLead = (estado: EstadoLead) => Promise<string>;

export type PatchEstadoLead = (id: string, estado: Partial<EstadoLead>) => Promise<void>;

export type DeleteEstadoLead = (id: string) => Promise<void>;