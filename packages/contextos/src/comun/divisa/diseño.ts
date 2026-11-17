import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export type DatosDivisa = {
    id: string;
    descripcion: string;
    tasaConversion: number;
    fecha: Date | null;
    codigoIso: string;
    simbolo: string;
    monedasBilletes: string;
    cifrasDecimales: number;
};

/** Eneboo `divisas` (sin la bandera). */
export interface Divisa extends Entidad, DatosDivisa {
    id: string;
}

export type NuevaDivisa = DatosDivisa & Modelo;

export type CambiosDivisa = Partial<Omit<DatosDivisa, "id">>;

export type GetDivisasMaestro = (criteria: Criteria) => RespuestaLista<Divisa>;
export type GetDivisa = (id: string) => Promise<Divisa>;
export type PostDivisa = (nueva: NuevaDivisa) => Promise<string>;
export type PatchDivisa = (id: string, cambios: CambiosDivisa) => Promise<void>;
export type DeleteDivisa = (id: string) => Promise<void>;
