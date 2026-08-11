import { Entidad, Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";

export const ESTADOS_COMUNICACION = {
    NO_LEIDA: "No leida",
    LEIDA: "Leida",
    BORRADA: "Borrada",
} as const;

export type EstadoComunicacion =
    (typeof ESTADOS_COMUNICACION)[keyof typeof ESTADOS_COMUNICACION];

export interface Comunicacion extends Entidad {
    id: string;
    usuarioDestinoId: string;
    estado: EstadoComunicacion;
    asunto: string;
    cuerpo: string;
    fechaEnvio: Date;
    fechaLectura: Date | null;
    fechaBorrado: Date | null;
}

export type GetComunicaciones = (
    filtro: Filtro,
    orden: Orden,
    paginacion: Paginacion
) => RespuestaLista<Comunicacion>;

export type GetComunicacion = (id: string) => Promise<Comunicacion>;
