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
