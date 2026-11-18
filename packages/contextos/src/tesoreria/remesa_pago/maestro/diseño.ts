import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { NuevaRemesaPago, RemesaPago } from "../diseño.js";

export type EstadoMaestroRemesaPago = 'INICIAL' | 'CREANDO_REMESA_NOMINAS';

export type ContextoMaestroRemesaPago = {
    estado: EstadoMaestroRemesaPago;
    remesas: ListaActivaEntidades<RemesaPago>;
};

export type NuevaRemesaNominas = Pick<NuevaRemesaPago, 'cuentaId' | 'fechaPago' | 'nominaIds'>;
