import { GrupoEpigrafe } from "../diseño.ts";

export type EstadoDetalleGrupoEpigrafe = 'INICIAL' | 'ABIERTO' | 'BORRANDO';

export type ContextoDetalleGrupoEpigrafe = {
    estado: EstadoDetalleGrupoEpigrafe;
    grupo: GrupoEpigrafe;
};
