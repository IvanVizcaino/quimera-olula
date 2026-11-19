import { ClaseAbc, OrigenRotacion } from "#/almacen/slotting/diseño.ts";

export type CarasPasillo = "AMBAS" | "IZQUIERDA" | "DERECHA";
export type Lado = "IZQUIERDA" | "DERECHA";

export interface PasilloMapa {
    pasilloId: string;
    pasillo: string;
    orden: number;
    caras: CarasPasillo;
    /** Módulos por cara. */
    modulos: number;
    accesos: string;
    /** Nivel más alto con ubicaciones + 1 (0 si no tiene). */
    niveles: number;
}

export interface ZonaMapa {
    zonaId: string;
    zona: string;
    funcion: string;
    pasillos: PasilloMapa[];
}

export interface PickingFijoMapa {
    articuloId: string;
    minimo: number;
    maximo: number;
}

export interface UbicacionMapa {
    ubicacionId: string;
    ubicacion: string;
    zonaId: string;
    pasilloId: string | null;
    modulo: number | null;
    nivel: number | null;
    hueco: number | null;
    formato: string | null;
    bloqueada: boolean;
    cantidad: number;
    articulos: string[];
    claseArticulo: ClaseAbc | null;
    clasesAlmacenamiento: string[];
    accesibilidad: number | null;
    claseUbicacion: ClaseAbc | null;
    pickingFijo: PickingFijoMapa | null;
}

export interface MapaAlmacen {
    zonas: ZonaMapa[];
    ubicaciones: UbicacionMapa[];
}

export type CapaMapa =
    | "OCUPACION"
    | "ABC_UBICACION"
    | "ABC_ARTICULO"
    | "SLOTTING"
    | "CLASE_ALMACENAMIENTO"
    | "PICKING"
    | "BLOQUEO";

/** Clave de color: cada una tiene su clase CSS `tono-<clave>`. */
export type Tono = string;

export interface EntradaLeyenda {
    tono: Tono;
    texto: string;
}

/** Celda de un módulo en la planta, en unidades del SVG. */
export interface CeldaModulo {
    modulo: number;
    lado: Lado;
    x: number;
    y: number;
    ancho: number;
    alto: number;
}

export interface GeometriaPasillo {
    pasilloId: string;
    /** x del eje del pasillo (por donde se camina). */
    xEje: number;
    x: number;
    ancho: number;
    alto: number;
    celdas: CeldaModulo[];
}

export interface PuntoRecorrido {
    secuencia: number;
    ubicacionId: string;
    ubicacion: string;
    pasilloId: string;
    modulo: number;
}

export type GetMapa = (almacenId: string, dias: number, origen: OrigenRotacion) => Promise<MapaAlmacen>;
