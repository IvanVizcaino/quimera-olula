import { Entidad, RespuestaLista } from "@olula/lib/diseño.js";

export type TipoFamiliaLectra = "anidado" | "corte" | "suministro";

export interface FamiliaLectra extends Entidad {
    id: string;
    referencia: string;
    valorDefecto: boolean;
}

export type GetFamiliasLectra = (tipo: TipoFamiliaLectra) => RespuestaLista<FamiliaLectra>;

export type PostActualizarFamiliasLectra = () => Promise<void>;

export type PatchFamiliaLectraPorDefecto = (tipo: TipoFamiliaLectra, referencia: string) => Promise<void>;
