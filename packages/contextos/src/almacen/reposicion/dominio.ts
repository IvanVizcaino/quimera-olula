import { NecesidadReposicion, Reposicion } from "./diseño.ts";

export const reposicionVacia: Reposicion = { ordenId: null, necesidades: [] };

/** Disponible en el hueco de picking: físico + entrante - saliente. */
export const calcularDisponible = (n: Pick<NecesidadReposicion, "fisico" | "entrante" | "saliente">): number =>
    n.fisico + n.entrante - n.saliente;

/** Total a traspasar desde la reserva (suma de los orígenes de la necesidad). */
export const totalOrigenes = (n: Pick<NecesidadReposicion, "origenes">): number =>
    n.origenes.reduce((suma, o) => suma + o.cantidad, 0);

/** Texto con los orígenes de una necesidad: "UBIC (cant), UBIC2 (cant)". */
export const textoOrigenes = (n: Pick<NecesidadReposicion, "origenes">): string =>
    n.origenes.map((o) => `${o.ubicacion} (${o.cantidad})`).join(", ");

/** Se puede generar traspaso si alguna necesidad tiene al menos un origen con cantidad. */
export const puedeGenerarTraspaso = (r: Reposicion): boolean =>
    r.ordenId === null && r.necesidades.some((n) => totalOrigenes(n) > 0);

/** Una necesidad se puede marcar si tiene algún origen desde donde reponer. */
export const necesidadSeleccionable = (n: Pick<NecesidadReposicion, "origenes">): boolean =>
    totalOrigenes(n) > 0;

/** Al calcular, vienen marcadas todas las que se pueden reponer. */
export const seleccionInicial = (r: Reposicion): string[] =>
    r.necesidades.filter(necesidadSeleccionable).map((n) => n.pickingFijoId);

/** Si están marcadas todas las que se pueden marcar (y hay alguna). */
export const todasSeleccionadas = (r: Reposicion, seleccion: string[]): boolean => {
    const seleccionables = seleccionInicial(r);
    return seleccionables.length > 0 && seleccionables.every((id) => seleccion.includes(id));
};

/** Marca o desmarca una necesidad. */
export const marcarNecesidad = (seleccion: string[], id: string, marcada: boolean): string[] =>
    marcada ? [...new Set([...seleccion, id])] : seleccion.filter((s) => s !== id);

/** Se puede generar el traspaso si hay alguna necesidad marcada con origen. */
export const puedeGenerarSeleccion = (r: Reposicion, seleccion: string[]): boolean =>
    r.ordenId === null && r.necesidades.some((n) => seleccion.includes(n.pickingFijoId) && necesidadSeleccionable(n));

/** "REF - Descripción", o solo la referencia si no hay descripción. */
export const textoArticulo = (n: Pick<NecesidadReposicion, "articuloId" | "descripcion">): string =>
    n.descripcion ? `${n.articuloId} - ${n.descripcion}` : n.articuloId;

export type TipoSituacion = "fisico" | "entrante" | "saliente";

export interface ParteSituacion {
    tipo: TipoSituacion;
    cantidad: number;
}

/** Físico, entrante y saliente, aunque sean cero. */
export const situacion = (
    n: Pick<NecesidadReposicion, "fisico" | "entrante" | "saliente">
): ParteSituacion[] => [
    { tipo: "fisico" as const, cantidad: n.fisico },
    { tipo: "entrante" as const, cantidad: n.entrante },
    { tipo: "saliente" as const, cantidad: n.saliente },
];
