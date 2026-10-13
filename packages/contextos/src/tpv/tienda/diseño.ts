import { Criteria, Entidad, RespuestaLista } from "@olula/lib/diseño.ts";

export interface TiendaTpv extends Entidad {
    id: string;
    nombre: string;
}

export type GetTiendasTpv = (criteria: Criteria) => RespuestaLista<TiendaTpv>;
