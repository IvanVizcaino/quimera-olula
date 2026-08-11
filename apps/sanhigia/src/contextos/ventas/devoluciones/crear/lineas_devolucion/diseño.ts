import { LineaFacturaDevolucion } from "../../diseño.ts";

export type EstadoLineasDevolucion = "INICIAL";

export type ContextoLineasDevolucion = {
    estado: EstadoLineasDevolucion;
    lineas: LineaFacturaDevolucion[];
    borradoresCantidad: Record<string, string>;
};

export const contextoLineasDevolucionVacio: ContextoLineasDevolucion = {
    estado: "INICIAL",
    lineas: [],
    borradoresCantidad: {},
};
