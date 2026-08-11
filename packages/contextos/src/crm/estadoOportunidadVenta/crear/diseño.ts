import { Entidad } from "@olula/lib/diseño.ts";

export interface NuevoEstadoOportunidad extends Entidad {
    descripcion: string;
    probabilidad: number;
};