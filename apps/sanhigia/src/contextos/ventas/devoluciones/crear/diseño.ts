import { MotivoDevolucion } from "../../motivoDevolucion/diseño.ts";
import { FacturaDevolucion } from "../diseño.ts";

export type FacturaSeleccionada = {
    valor: string;
    descripcion: string;
};

export type EstadoCrearDevolucion =
    | "SELECCIONANDO_FACTURA"
    | "EDITANDO_DEVOLUCION"
    | "SELECCIONANDO_MOTIVO"
    | "GUARDANDO_DEVOLUCION";

export type ContextoCrearDevolucion = {
    estado: EstadoCrearDevolucion;
    facturaSeleccionada: FacturaSeleccionada | null;
    factura: FacturaDevolucion | null;
    motivoSeleccionado: MotivoDevolucion | null;
    descripcionMotivo: string;
    error: string;
};

export const contextoCrearDevolucionVacio: ContextoCrearDevolucion = {
    estado: "SELECCIONANDO_FACTURA",
    facturaSeleccionada: null,
    factura: null,
    motivoSeleccionado: null,
    descripcionMotivo: "",
    error: "",
};

export type FormCrearDevolucion = {
    razonDevolucion: string;
};
