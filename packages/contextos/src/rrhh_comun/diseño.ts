import { Entidad, Filtro, Orden, Paginacion, RespuestaListaConResumen } from "@olula/lib/diseño.js";

export type EstadoJornada = 'BORRADOR' | 'APROBADA' | 'ANULADA';
export type EstadoBorradorJornada = 'ACTIVA' | 'PAUSADA' | "CERRADA" | null;

export type ResumenJornadas = { mediaMinutos: number };
export type RespuestaListaJornada = RespuestaListaConResumen<RegistroJornada, ResumenJornadas>;

export interface PausaJornada extends Entidad {
    id: string;
    horaInicio: string;
    horaFin: string | null;
    causa: string;
}

export interface RegistroJornada extends Entidad {
    id: string;
    empleadoId: string;
    empleado: string;
    fecha: Date;
    horaEntrada: string | null;
    horaSalida: string | null;
    estado: EstadoJornada;
    observaciones: string | null;
    tiempoTotalPausas: number;
    minutosJornada: number;
    estadoBorrador: EstadoBorradorJornada;
    pausas: PausaJornada[];
}

export type NuevaJornada = {
    empleadoId: string;
    fecha: string;
    horaEntrada: string | null;
    horaSalida: string | null;
    observaciones: string | null;
};

export type CambiosJornada = {
    horaEntrada: string | null;
    horaSalida: string | null;
    observaciones: string | null;
    pausas: PausaJornada[];
};

export type CambiosPausa = {
    horaInicio: string;
    horaFin: string | null;
    causa: string;
};

export type AnulacionJornada = {
    motivo: string | null;
};

export type NuevaPausa = {
    horaInicio: string;
    causa: string;
};

export type ReactivacionJornada = {
    horaFin: string;
};

export type GetJornadas = (filtro: Filtro, orden: Orden, paginacion: Paginacion) => RespuestaListaJornada;
export type GetJornada = (id: string) => Promise<RegistroJornada>;
export type PostJornada = (jornada: NuevaJornada) => Promise<string>;
export type PatchJornada = (id: string, cambios: CambiosJornada) => Promise<void>;
export type PatchAnularJornada = (id: string, anulacion: AnulacionJornada) => Promise<void>;
