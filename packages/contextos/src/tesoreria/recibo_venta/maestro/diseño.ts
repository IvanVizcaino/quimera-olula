import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { TotalesReciboListado } from "../../comun/totales_recibo.ts";
import { ReciboVenta } from "../diseño.js";

export type EstadoMaestroReciboVenta = 'INICIAL' | 'AGRUPANDO' | 'REMESANDO';

export type ContextoMaestroReciboVenta = {
    estado: EstadoMaestroReciboVenta;
    recibos: ListaActivaEntidades<ReciboVenta>;
    totales: TotalesReciboListado | null;
    seleccionados: string[];
    remesaCreada: string | null;
};
