import { GrupoContableAmortizacion } from "../diseño.ts";

export type EstadoDetalleGrupoContableAmortizacion = "INICIAL" | "ABIERTO" | "BORRANDO";

export type ContextoDetalleGrupoContableAmortizacion = {
    estado: EstadoDetalleGrupoContableAmortizacion;
    grupo: GrupoContableAmortizacion;
};
