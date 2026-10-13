import { Subfamilia } from "../diseño.ts";

export type EstadoSubfamilia = "INICIAL" | "Editando" | "Borrando";

export type ContextoSubfamilia = {
    estado: EstadoSubfamilia;
    subfamilia: Subfamilia;
    subfamiliaInicial: Subfamilia;
};
