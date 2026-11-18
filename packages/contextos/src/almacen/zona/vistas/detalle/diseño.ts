import { Pasillo } from "#/almacen/pasillo/diseño.ts";
import { Ubicacion } from "#/almacen/ubicacion/diseño.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import { ListaEntidades } from "@olula/lib/ListaEntidades.js";
import { Zona } from "../../diseño.ts";

export type EstadoDetalleZona =
    | "INICIAL"
    | "ABIERTO"
    | "BORRANDO"
    | "CREANDO_PASILLO"
    | "CAMBIANDO_PASILLO"
    | "BORRANDO_PASILLO"
    | "GENERANDO_UBICACIONES";

export type ContextoDetalleZona = {
    estado: EstadoDetalleZona;
    zona: Zona;
    /** Página de ubicaciones de la zona que se ve en su pestaña, con su total y su criterio. */
    ubicaciones: Ubicacion[];
    totalUbicaciones: number;
    criteriaUbicaciones: Criteria;
    pasillos: ListaEntidades<Pasillo>;
};
