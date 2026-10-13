import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { UnidadMedida } from "../diseño.ts";

export type EstadoMaestroUnidadMedida = "INICIAL" | "CREANDO";

export type ContextoMaestroUnidadMedida = {
    estado: EstadoMaestroUnidadMedida;
    unidades: ListaActivaEntidades<UnidadMedida>;
};

export const metaTablaUnidadMedida: MetaTabla<UnidadMedida> = [
    { id: "id", cabecera: "Código" },
    { id: "descripcion", cabecera: "Descripción" },
    { id: "magnitud", cabecera: "Magnitud" },
    { id: "factorConv", cabecera: "Factor conv." },
];
