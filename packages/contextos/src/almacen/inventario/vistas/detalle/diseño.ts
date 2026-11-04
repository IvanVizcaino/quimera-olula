import { Inventario, LineaInventario } from "../../diseño.ts";

export type EstadoDetalleInventario =
    | "INICIAL"
    | "ABIERTO"
    | "BORRANDO"
    | "CREANDO_LINEA"
    | "BORRANDO_LINEA"
    | "CARGANDO_LECTURAS"
    | "REGULARIZANDO_RESTO";

export type ContextoDetalleInventario = {
    estado: EstadoDetalleInventario;
    inventario: Inventario;
    lineas: LineaInventario[];
    lineaActiva: LineaInventario | null;
};
