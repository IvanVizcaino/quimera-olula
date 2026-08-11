import { MotivoDevolucion } from "../diseño.ts";

export type EstadoDetalleMotivoDevolucion = "INICIAL" | "BORRANDO";

export type ContextoDetalleMotivoDevolucion = {
    estado: EstadoDetalleMotivoDevolucion;
    motivoDevolucion: MotivoDevolucion;
};