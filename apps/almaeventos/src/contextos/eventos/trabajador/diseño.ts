import { Entidad } from "@olula/lib/diseño.ts";

export interface Trabajador extends Entidad {
    id: string;
    nombre: string;
    coste: number;
};

export type NuevoTrabajador = {
    id: string;
    nombre: string;
    coste: number;
};