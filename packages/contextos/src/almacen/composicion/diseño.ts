import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/**
 * Composición (ensamblado de kits) de la ext. Eneboo `articulos_comp` (T2.6).
 * Tablas Eneboo: `composiciones` / `lineascomposicion`.
 * Contrato API: `/almacen/composicion` (olula_servidor, plugin `articulos_compuestos`).
 */
export interface LineaComposicion extends Entidad {
    /** Vacío en líneas nuevas todavía no guardadas. */
    id: string;
    articuloId: string;
    descripcion?: string;
    cantidad: number;
    almacenId: string;
}

export interface Composicion extends Entidad {
    id: string;
    /** `YYYY-MM-DD` */
    fecha: string;
    /** `HH:MM` o `HH:MM:SS` */
    hora: string;
    almacenId: string;
    articuloId: string;
    descripcion: string;
    cantidad: number;
    usuarioId: string;
    lineas: LineaComposicion[];
}

export interface NuevaComposicion extends Modelo {
    almacenId: string;
    articuloId: string;
    cantidad: number;
    fecha: string;
    hora: string;
}

export type CambiosComposicion = Partial<
    Pick<Composicion, "almacenId" | "cantidad" | "fecha" | "hora">
> & {
    /** Lista COMPLETA (diff por `id`: sin id = alta; las ausentes se borran). */
    lineas?: LineaComposicion[];
    /** Botón «Generar composición»: rehace las líneas desde `articuloscomp`. */
    regenerarLineas?: boolean;
};

export type GetComposicion = (id: string) => Promise<Composicion>;
export type GetComposiciones = (criteria: Criteria) => RespuestaLista<Composicion>;
export type PostComposicion = (nueva: NuevaComposicion) => Promise<string>;
export type PatchComposicion = (id: string, cambios: CambiosComposicion) => Promise<void>;
export type DeleteComposicion = (id: string) => Promise<void>;
