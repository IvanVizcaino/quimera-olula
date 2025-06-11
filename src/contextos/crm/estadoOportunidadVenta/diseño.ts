import { Entidad } from "../../comun/diseño.ts";

export interface EstadoOportunidad extends Entidad {
    id: string;
    descripcion: string;
    probabilidad: number;
    valor_defecto: boolean;
};