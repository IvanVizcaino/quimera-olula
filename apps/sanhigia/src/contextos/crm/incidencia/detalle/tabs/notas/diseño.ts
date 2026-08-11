import { Entidad, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";

export interface Nota extends Entidad {
    id: string;
    texto: string;
    fecha: string;
    agenteId: string;
    incidenciaId: string;
}

export type GetNotas = (
    incidenciaId: string,
    paginacion?: Paginacion
) => RespuestaLista<Nota>;

export type PostNota = (
    nota: Omit<Nota, "id">
) => Promise<string>;

export type DeleteNota = (id: string) => Promise<void>;
