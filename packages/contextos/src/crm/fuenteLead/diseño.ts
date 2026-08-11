import { Entidad, Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";

export interface FuenteLead extends Entidad {
    id: string;
    descripcion: string;
    valorDefecto: boolean;
};

export type GetFuenteLead = (id: string) => Promise<FuenteLead>;

export type GetFuentesLead = (filtro: Filtro, orden: Orden, paginacion: Paginacion) => RespuestaLista<FuenteLead>;

export type PostFuenteLead = (fuente: FuenteLead) => Promise<string>;

export type PatchFuenteLead = (id: string, fuente: Partial<FuenteLead>) => Promise<void>;

export type DeleteFuenteLead = (id: string) => Promise<void>;