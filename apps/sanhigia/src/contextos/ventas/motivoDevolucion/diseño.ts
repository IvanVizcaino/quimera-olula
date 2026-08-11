import { Entidad } from "@olula/lib/diseño.ts";

export interface MotivoDevolucion extends Entidad {
    id: string;
    tipo: string;
    descripcion: string | null;
    otros: boolean;
}

export type NuevoMotivoDevolucion = Omit<MotivoDevolucion, "id">;

export type GetMotivoDevolucion = (id: string) => Promise<MotivoDevolucion>;
export type PostMotivoDevolucion = (
    motivoDevolucion: NuevoMotivoDevolucion
) => Promise<string>;
export type PatchMotivoDevolucion = (
    id: string,
    motivoDevolucion: Partial<MotivoDevolucion>
) => Promise<void>;