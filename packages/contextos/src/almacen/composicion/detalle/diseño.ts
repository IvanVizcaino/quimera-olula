import { Composicion } from "../diseño.ts";

export type EstadoComposicion = "INICIAL" | "Editando" | "Generando" | "Borrando";

export type ContextoComposicion = {
    estado: EstadoComposicion;
    composicion: Composicion;
    composicionInicial: Composicion;
};
