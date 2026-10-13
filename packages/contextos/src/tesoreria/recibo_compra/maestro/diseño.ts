import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { TotalesReciboListado } from "../../comun/totales_recibo.ts";
import { ReciboCompra } from "../diseño.js";

export type EstadoMaestroReciboCompra = 'INICIAL' | 'REMESANDO';

export type ContextoMaestroReciboCompra = {
    estado: EstadoMaestroReciboCompra;
    recibos: ListaActivaEntidades<ReciboCompra>;
    totales: TotalesReciboListado | null;
    seleccionados: string[];
    remesaCreada: string | null;
};
