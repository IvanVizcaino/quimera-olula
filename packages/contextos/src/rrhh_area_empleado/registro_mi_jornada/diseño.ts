export * from "#/rrhh_comun/diseño.ts";
import type { NuevaPausa, ReactivacionJornada } from "#/rrhh_comun/diseño.ts";

export type PatchPausarJornada = (id: string, pausa: NuevaPausa) => Promise<void>;
export type PatchReactivarJornada = (id: string, reactivacion: ReactivacionJornada) => Promise<void>;
