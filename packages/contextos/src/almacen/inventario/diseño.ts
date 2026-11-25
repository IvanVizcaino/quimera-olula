import { RegularizacionStock } from "#/almacen/stock/diseño.ts";
import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/** Cabecera de inventario (tabla `inventarios` de Eneboo). */
export interface Inventario extends Entidad {
    id: string;
    almacenId: string;
    almacen: string | null;
    fecha: string;
    hora: string;
    observaciones: string | null;
}

export interface NuevoInventario extends Modelo {
    almacenId: string;
    fecha: Date;
    hora: string;
    observaciones: string;
}

export type CambiosInventario = Partial<Pick<Inventario, "observaciones">>;

/**
 * Las líneas del inventario son regularizaciones de stock con su código de
 * inventario: se aplican al stock al crearlas, como en Eneboo.
 */
export type LineaInventario = RegularizacionStock;

export interface NuevaLineaInventario extends Modelo {
    articuloId: string;
    cantidad: number;
    motivo: string;
}

/** Separador del CSV/TXT: "" = que lo detecte el servidor. */
export type SeparadorFichero = "" | "|" | ";" | "," | "\t";

export interface OpcionesCargaFichero {
    separador: SeparadorFichero;
    ignorarPrimeraLinea: boolean;
    /** Valida y resume sin grabar nada. */
    simular: boolean;
    /** Carga las filas válidas aunque haya rechazadas. */
    omitirRechazadas: boolean;
}

/** Fila del fichero que el servidor no acepta, con su número y el motivo. */
export interface LineaRechazada {
    linea: number;
    referencia: string;
    cantidad: string;
    motivo: string;
}

/** Artículo leído del fichero: suma de sus lecturas y stock actual. */
export interface ArticuloLeido {
    articuloId: string;
    descripcion: string | null;
    lecturas: number;
    cantidad: number;
    cantidadActual: number;
}

/**
 * Resultado de cargar (o simular) un fichero. `cargado` es falso al simular
 * o si hay rechazadas y no se ha pedido omitirlas: entonces no se graba nada.
 */
export interface ResultadoCargaFichero {
    cargado: boolean;
    lecturas: number;
    lineas: number;
    articulos: ArticuloLeido[];
    rechazadas: LineaRechazada[];
}

export type GetInventario = (id: string) => Promise<Inventario>;
export type GetInventarios = (criteria: Criteria) => RespuestaLista<Inventario>;
export type PostInventario = (nuevo: NuevoInventario) => Promise<string>;
export type PatchInventario = (id: string, cambios: CambiosInventario) => Promise<void>;
export type DeleteInventario = (id: string) => Promise<void>;
export type GetLineasInventario = (id: string) => Promise<LineaInventario[]>;
export type PostLineaInventario = (id: string, linea: NuevaLineaInventario) => Promise<string>;
export type DeleteLineaInventario = (id: string, lineaId: string) => Promise<void>;
export type CambiarLineaInventario = (
    id: string,
    linea: LineaInventario,
    cambios: NuevaLineaInventario
) => Promise<string>;
export type PostFicheroInventario = (
    id: string,
    fichero: File,
    opciones: OpcionesCargaFichero
) => Promise<ResultadoCargaFichero>;
export type PatchRegularizarRestoInventario = (id: string) => Promise<number>;
