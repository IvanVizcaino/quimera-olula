import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Subfamilia } from "../diseño.ts";

export type EstadoMaestroSubfamilia = "INICIAL" | "CREANDO";

export type ContextoMaestroSubfamilia = {
    estado: EstadoMaestroSubfamilia;
    subfamilias: ListaActivaEntidades<Subfamilia>;
};

export const metaTablaSubfamilia: MetaTabla<Subfamilia> = [
    { id: "id", cabecera: "Código" },
    { id: "descripcion", cabecera: "Descripción" },
    { id: "descripcionFamilia", cabecera: "Familia" },
];
