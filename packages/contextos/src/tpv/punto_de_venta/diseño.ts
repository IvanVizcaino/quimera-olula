import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export interface PuntoVentaTpv extends Entidad {
    id: string;
    nombre: string;
    agenteId: string | null;
    serieId: string | null;
    tiendaId: string | null;
}

export interface NuevoPuntoVentaTpv extends Modelo {
    id: string;
    nombre: string;
    serieId: string;
    tiendaId: string;
    agenteId: string | null;
}

export type CambiosPuntoVentaTpv = {
    nombre?: string;
    serieId?: string;
    tiendaId?: string;
    agenteId?: string | null;
};

export type GetPuntoVentaTpv = (id: string) => Promise<PuntoVentaTpv>;
export type GetPuntosVentaTpv = (criteria: Criteria) => RespuestaLista<PuntoVentaTpv>;
export type PostPuntoVentaTpv = (nuevo: NuevoPuntoVentaTpv) => Promise<string>;
export type PatchPuntoVentaTpv = (id: string, cambios: CambiosPuntoVentaTpv) => Promise<void>;
export type DeletePuntoVentaTpv = (id: string) => Promise<void>;
