import { Entidad, Modelo } from "@olula/lib/diseño.ts";

/** Tabla `series` (series.mtd / series.ui). */
export interface DatosSerie extends Modelo {
    descripcion: string;
    irpf: number;
    sinIva: boolean;
    codigoCuenta: string;
    codigoSubcuenta: string;
    rectificativa: boolean;
    simplificada: boolean;
}

export interface Serie extends Entidad, DatosSerie {
    id: string;
    descripcionCuenta: string;
    descripcionSubcuenta: string;
}

export interface NuevaSerie extends DatosSerie {
    id: string;
}
