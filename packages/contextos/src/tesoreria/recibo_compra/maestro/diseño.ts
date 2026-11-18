import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ReciboCompra } from "../diseño.js";

export type EstadoMaestroReciboCompra = 'INICIAL' | 'REMESANDO';

export type ContextoMaestroReciboCompra = {
    estado: EstadoMaestroReciboCompra;
    recibos: ListaActivaEntidades<ReciboCompra>;
    seleccionados: string[];
    remesaCreada: string | null;
};

export type NuevaRemesaRecibos = {
    cuentaId: string;
    fechaPago: Date;
};
