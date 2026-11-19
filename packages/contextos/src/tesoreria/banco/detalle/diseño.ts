import { Banco, Sucursal } from "../diseño.ts";

export type EstadoDetalleBanco =
    | "INICIAL"
    | "ABIERTO"
    | "BORRANDO"
    | "CREANDO_SUCURSAL"
    | "CAMBIANDO_SUCURSAL"
    | "BORRANDO_SUCURSAL";

export type ContextoDetalleBanco = {
    estado: EstadoDetalleBanco;
    banco: Banco;
    sucursalActiva: Sucursal | null;
};
