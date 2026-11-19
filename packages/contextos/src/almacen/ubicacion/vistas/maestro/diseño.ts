import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Ubicacion } from "../../diseño.ts";
import { descripcionEstadoUbicacion } from "../../dominio.ts";

export type EstadoMaestroUbicacion = "INICIAL" | "CREANDO";

export type ContextoMaestroUbicacion = {
    estado: EstadoMaestroUbicacion;
    ubicaciones: ListaActivaEntidades<Ubicacion>;
};

export const metaTablaUbicacion: MetaTabla<Ubicacion> = [
    { id: "codigo", cabecera: "Código" },
    { id: "zona", cabecera: "Zona" },
    { id: "pasillo", cabecera: "Pasillo" },
    { id: "modulo", cabecera: "Módulo" },
    { id: "nivel", cabecera: "Nivel" },
    { id: "hueco", cabecera: "Hueco" },
    { id: "tipoUbicacion", cabecera: "Tipo" },
    { id: "estado", cabecera: "Estado", render: (u) => descripcionEstadoUbicacion(u.estado) },
];
