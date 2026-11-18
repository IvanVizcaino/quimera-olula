import {
    CandidatoConciliacion, CandidatoListaConciliacion, Conciliacion, ItemConciliacion, MovimientoBancario,
    PartidaHuerfana, RemesaCandidata,
} from "../diseño.js";

/**
 * CONCILIANDO / CONCILIANDO_REMESA / DESCONCILIANDO / IGNORANDO / REACTIVANDO: modales de
 * las acciones (ver conciliar/, conciliar_asiento/, conciliar_remesa/, desconciliar/,
 * ignorar/, reactivar/ a nivel de módulo).
 */
export type EstadoDetalleConciliacion =
    | 'INICIAL'
    | 'ABIERTO'
    | 'CONCILIANDO'
    | 'CONCILIANDO_REMESA'
    | 'DESCONCILIANDO'
    | 'IGNORANDO'
    | 'REACTIVANDO';

/**
 * Conciliación elegida, pendiente de confirmar en el modal: una candidata
 * (`conciliacionId`) o una a mano (un recibo de la búsqueda o un asiento).
 * `items` contiene los movimientos ERP a resolver (1 en el caso habitual).
 */
export type ConciliacionSeleccionada = {
    conciliacionId: string | null;
    items: ItemConciliacion[];
    probabilidad: number | null;
    justificacion: string | null;
};

export type ContextoDetalleConciliacion = {
    estado: EstadoDetalleConciliacion;
    movimiento: MovimientoBancario;
    /** Conciliaciones candidatas propuestas por las reglas o la IA. */
    conciliaciones: Conciliacion[];
    /** Conciliación ya aplicada (solo cuando movimiento.estado === 'conciliado'). */
    conciliacionAplicada: Conciliacion | null;
    /** Recibos para conciliar a mano; solo tiene sentido si el movimiento no está resuelto. */
    candidatos: CandidatoConciliacion[];
    candidatosTexto: string;
    /** Remesas de cobro que puede pagar el movimiento; solo si es un ingreso no resuelto. */
    remesas: RemesaCandidata[];
    /** Partidas contables de la cuenta sin movimiento bancario; solo si el movimiento no está resuelto. */
    partidas: PartidaHuerfana[];
    conciliacionSeleccionada: ConciliacionSeleccionada | null;
    /**
     * Candidatos reunidos para conciliarlos juntos. Guarda los candidatos completos, no sus
     * ids, para conservarlos al buscar otro texto (la búsqueda recarga los recibos).
     */
    seleccion: CandidatoListaConciliacion[];
    /** Remesa elegida, pendiente de que el usuario confirme sus recibos en el modal. */
    remesaSeleccionada: RemesaCandidata | null;
};
