import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export interface Caja extends Entidad {
    id: string;
    lpn: string;
    idUbicacion: string;
    ubicacion: string;
    idContenedor?: string | null;
}

export interface MovimientoCaja extends Entidad {
    id: string;
    idLote: string;
    cantidad: string;
    fechaHora: Date;
    idUbicacion: string;
    ubicacion: string;
}

export interface MaterialCaja extends Entidad {
    id: string;
    sku: string;
    descripcion: string;
    cantidad: number;
    movimientos: MovimientoCaja[];
}

// Caja con su contenido completo (árbol de materiales + subcajas)
export interface CajaContenido extends Caja {
    contenido: ComponenteCaja[];
}

export type ComponenteCaja = CajaContenido | MaterialCaja;

export interface NuevaCaja extends Modelo {
    idUbicacion: string;
    idContenedor?: string | null;
}

export type CambiosCaja = Partial<Caja>;

export type GetCaja = (id: string) => Promise<CajaContenido>;

export type GetCajas = (criteria: Criteria) => RespuestaLista<Caja>;

export type PostCaja = (nuevaCaja: NuevaCaja) => Promise<string>;

export type PatchCaja = (id: string, cambios: CambiosCaja) => Promise<void>;

export type DeleteCaja = (id: string) => Promise<void>;
