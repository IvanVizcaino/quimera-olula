import { Epigrafe } from "../diseño.ts";

export type EstadoDetalleEpigrafe = 'INICIAL' | 'ABIERTO' | 'BORRANDO';

export type ContextoDetalleEpigrafe = {
    estado: EstadoDetalleEpigrafe;
    epigrafe: Epigrafe;
};
