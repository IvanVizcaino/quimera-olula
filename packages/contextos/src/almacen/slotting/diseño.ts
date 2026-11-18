export type ClaseAbc = "A" | "B" | "C";

export interface ArticuloAbc {
    articuloId: string;
    descripcion: string;
    lineas: number;
    unidades: number;
    porcentajeAcumulado: number;
    clase: ClaseAbc;
}

export interface UbicacionPropuesta {
    ubicacionId: string;
    ubicacion: string;
    zona: string;
    accesibilidad: number;
    claseUbicacion: ClaseAbc;
}

export interface PropuestaUbicacion {
    articuloId: string;
    clase: ClaseAbc;
    ubicaciones: UbicacionPropuesta[];
}

export type AccionRecolocacion = "INTERCAMBIAR" | "MOVER";

export interface Recolocacion {
    articuloId: string;
    clase: ClaseAbc;
    ubicacion: string;
    claseUbicacion: ClaseAbc;
    accion: AccionRecolocacion;
    conArticuloId: string | null;
    conUbicacion: string | null;
    beneficio: number;
}

export type GetAbc = (almacenId: string, dias: number) => Promise<ArticuloAbc[]>;
export type GetPropuesta = (almacenId: string, articuloId: string, limite: number) => Promise<PropuestaUbicacion>;
export type GetRecolocacion = (almacenId: string, dias: number, limite: number) => Promise<Recolocacion[]>;
