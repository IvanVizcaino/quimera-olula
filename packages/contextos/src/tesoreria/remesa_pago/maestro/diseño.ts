import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { RemesaPago } from "../diseño.js";

export type EstadoMaestroRemesaPago = 'INICIAL';

export type ContextoMaestroRemesaPago = {
    estado: EstadoMaestroRemesaPago;
    remesas: ListaActivaEntidades<RemesaPago>;
};
