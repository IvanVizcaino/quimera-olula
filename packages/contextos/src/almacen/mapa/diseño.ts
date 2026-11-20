import { AccionParada } from "#/almacen/orden/diseño.ts";
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
    planta: PlantaAlmacen | null;
}

// ─── Planta real (doc/especificaciones/sga_planta.md), en metros ─────────

export interface MedidasPlanta {
    /** Largo de un módulo a lo largo del pasillo. */
    largoModulo: number;
    /** Fondo de la estantería. */
    fondo: number;
    /** Ancho del pasillo por el que se camina. */
    anchoPasillo: number;
}

/** Las medidas de un pasillo que no son las de la planta. */
export type MedidasPropias = Partial<MedidasPlanta>;

export type Giro = 0 | 90 | 180 | 270;

export interface PasilloEnPlanta {
    pasilloId: string;
    /** Esquina superior izquierda del rectángulo ya girado. */
    x: number;
    y: number;
    /** Horario, sobre el dibujo con el sentido de avance hacia abajo. */
    giro: Giro;
    medidas: MedidasPropias;
}

export type TipoElemento = "MUELLE" | "PUERTA" | "OFICINA" | "COLUMNA" | "OTRO";

export interface ElementoPlanta {
    tipo: TipoElemento;
    nombre: string;
    x: number;
    y: number;
    ancho: number;
    largo: number;
}

export interface PlantaAlmacen {
    ancho: number;
    largo: number;
    medidas: MedidasPlanta;
    pasillos: PasilloEnPlanta[];
    elementos: ElementoPlanta[];
}

export interface Rect {
    x: number;
    y: number;
    ancho: number;
    largo: number;
}

/** Celda de un módulo en la planta real, ya girada. */
export interface CeldaPlanta extends Rect {
    modulo: number;
}

export interface GeometriaPasilloPlanta extends Rect {
    pasilloId: string;
    celdas: CeldaPlanta[];
    /** Suelo por el que se camina. */
    suelo: Rect;
    /** Flecha del sentido de avance: de la entrada hacia dentro. */
    flecha: { x1: number; y1: number; x2: number; y2: number };
}

export type VistaMapa = "ESQUEMA" | "PLANTA";

/** Lo elegido en el editor de la planta. */
export type ElegidoPlanta =
    | { tipo: "PASILLO"; pasilloId: string }
    | { tipo: "ELEMENTO"; indice: number };

export type GuardarPlanta = (almacenId: string, planta: PlantaAlmacen) => Promise<void>;

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
    accion: AccionParada;
}

export type GetMapa = (almacenId: string, dias: number, origen: OrigenRotacion) => Promise<MapaAlmacen>;
