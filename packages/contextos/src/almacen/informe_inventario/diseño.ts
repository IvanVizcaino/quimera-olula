/**
 * Informes «Inventario» e «Inventario valorado» (fichas `i_inventario` de
 * Eneboo). Las fichas de criterios usan el patrón común de
 * `comun/informe_documentos`; el resultado es propio: stock agrupado por
 * almacén, con precio, valor y totales solo en el valorado.
 */

export type FormatoHoja = "xlsx" | "ods";

export interface FilaInventario {
    referencia: string;
    descripcion: string | null;
    cantidad: number;
    /** `null` en el informe sin valorar. */
    precio: number | null;
    valor: number | null;
}

export interface GrupoInventario {
    almacenId: string;
    almacen: string | null;
    direccion: string | null;
    poblacion: string | null;
    filas: FilaInventario[];
    total: number | null;
}

export interface ResultadoInventario {
    titulo: string;
    valorado: boolean;
    /** Fecha del stock (ISO) o `null` con el stock actual. */
    fecha: string | null;
    tipoValoracion: string | null;
    porPvp: number | null;
    grupos: GrupoInventario[];
    total: number | null;
    totalArticulos: number;
}

export type GetResultadoInventario = (url: string, id: string) => Promise<ResultadoInventario>;
export type GetReportInventario = (url: string, id: string) => Promise<Blob>;
export type GetHojaInventario = (url: string, id: string, formato: FormatoHoja) => Promise<Blob>;
