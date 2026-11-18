import { FormaPago } from "../diseño.ts";

export type EstadoDetalleFormaPago = "INICIAL" | "ABIERTO" | "BORRANDO" | "EDITANDO_PLAZOS";

export type ContextoDetalleFormaPago = {
    estado: EstadoDetalleFormaPago;
    formaPago: FormaPago;
};
