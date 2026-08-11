import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Ubicacion } from "../../diseño.ts";

export type EstadoMaestroUbicacion = "INICIAL" | "CREANDO";

export type ContextoMaestroUbicacion = {
    estado: EstadoMaestroUbicacion;
    ubicaciones: ListaActivaEntidades<Ubicacion>;
};

export const metaTablaUbicacion: MetaTabla<Ubicacion> = [
    { id: "codigo", cabecera: "Código" },
    { id: "zona", cabecera: "Zona" },
];
