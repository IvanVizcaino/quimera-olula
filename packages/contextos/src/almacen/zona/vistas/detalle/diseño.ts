import { Ubicacion } from "#/almacen/ubicacion/diseño.ts";
import { Zona } from "../../diseño.ts";

export type EstadoDetalleZona = "INICIAL" | "ABIERTO" | "BORRANDO";

export type ContextoDetalleZona = {
    estado: EstadoDetalleZona;
    zona: Zona;
    ubicaciones: Ubicacion[];
};
