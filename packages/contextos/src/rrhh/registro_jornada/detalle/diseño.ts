import { MetaModelo } from "@olula/lib/dominio.js";
import { registroJornadaVacio, metaRegistroJornada } from "../dominio.ts";
import { PausaJornada, RegistroJornada } from "../diseño.ts";

export type EstadoDetalleJornada = (
    'INICIAL' | 'BORRADOR' | 'APROBADA' | 'ANULADA'
    | 'APROBANDO' | 'ANULANDO'
    | 'CREANDO_PAUSA' | 'EDITANDO_PAUSA' | 'BORRANDO_PAUSA'
);

export type ContextoDetalleJornada = {
    estado: EstadoDetalleJornada;
    jornada: RegistroJornada;
    pausaActiva: PausaJornada | null;
};

export const jornadaVacia: RegistroJornada = registroJornadaVacio;

export const metaJornada: MetaModelo<RegistroJornada> = metaRegistroJornada;
