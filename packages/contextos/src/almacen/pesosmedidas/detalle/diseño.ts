import { UnidadMedida } from "../diseño.ts";

export type EstadoUnidadMedida = "INICIAL" | "Editando" | "Borrando";

export type ContextoUnidadMedida = {
    estado: EstadoUnidadMedida;
    unidad: UnidadMedida;
    unidadInicial: UnidadMedida;
};
