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

export interface LecturasInventario extends Modelo {
    contenido: string;
    separador: string;
    ignorarPrimeraLinea: boolean;
}

export type ResultadoCargaLecturas = { lecturas: number; lineas: number };

export type GetInventario = (id: string) => Promise<Inventario>;
export type GetInventarios = (criteria: Criteria) => RespuestaLista<Inventario>;
export type PostInventario = (nuevo: NuevoInventario) => Promise<string>;
export type PatchInventario = (id: string, cambios: CambiosInventario) => Promise<void>;
export type DeleteInventario = (id: string) => Promise<void>;
export type GetLineasInventario = (id: string) => Promise<LineaInventario[]>;
export type PostLineaInventario = (id: string, linea: NuevaLineaInventario) => Promise<string>;
export type DeleteLineaInventario = (id: string, lineaId: string) => Promise<void>;
export type PostLecturasInventario = (
    id: string,
    lecturas: LecturasInventario
) => Promise<ResultadoCargaLecturas>;
export type PatchRegularizarRestoInventario = (id: string) => Promise<number>;
