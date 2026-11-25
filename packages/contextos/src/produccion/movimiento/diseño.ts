import { Entidad } from "@olula/lib/diseño.ts";

/** Movimiento de stock de un proceso de producción (`movistock` con `idproceso`). */
export interface MovimientoProduccion extends Entidad {
    id: string;
    /** `entrada` (el producto en el lote de la orden) o `consumo` (un componente). */
    tipo: string;
    procesoId: string;
    ordenId: string;
    articuloId: string;
    articulo: string;
    almacenId: string;
    /** Positiva la entrada, negativa el consumo. */
    cantidad: number;
    /** PTE (previsto) o HECHO. */
    estado: string;
    /** En la entrada, el lote fabricado; en un consumo, el de la materia prima. */
    loteId: string;
    /** En un consumo, el lote que se fabrica. */
    loteProducidoId: string;
    componenteId: string;
    /** Tarea del tipo de proceso en la que se consume. */
    tareaProcesoId: string;
    /** Tarea que lo hizo (HECHO). */
    tareaId: string;
    fechaPrevista: string;
    fechaReal: string;
}

export type GetMovimientosOrden = (ordenId: string) => Promise<MovimientoProduccion[]>;
