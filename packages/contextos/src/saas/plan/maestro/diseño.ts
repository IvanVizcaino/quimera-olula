import { Catalogo } from "../../catalogo/diseño.js";
import { Plan } from "../diseño.js";

export type EstadoMaestroPlan = 'INICIAL' | 'CREANDO';

export type ContextoMaestroPlan = {
    estado: EstadoMaestroPlan;
    planes: Plan[];
    /** Catálogo completo: módulos y límites sobre los que se compone cada plan. */
    catalogo: Catalogo | null;
    activo: string | null;
};
