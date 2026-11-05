import { ConexionBancaria, PrestamoBancario } from "../diseño.js";

/**
 * CONFIGURANDO_PRESTAMO / VIENDO_CUOTAS: modales de los préstamos (ver
 * configurar_prestamo/ y cuotas_prestamo/ a nivel de módulo).
 */
export type EstadoDetalleConexionBancaria =
    | 'INICIAL'
    | 'ABIERTO'
    | 'REAUTENTICANDO'
    | 'DESCONECTANDO'
    | 'CONFIGURANDO_PRESTAMO'
    | 'VIENDO_CUOTAS';

export type ContextoDetalleConexionBancaria = {
    estado: EstadoDetalleConexionBancaria;
    conexion: ConexionBancaria;
    /** Préstamos leídos del banco (productos `loans`), sin sus cuotas. */
    prestamos: PrestamoBancario[];
    /** El préstamo del modal abierto; con sus cuotas en VIENDO_CUOTAS. */
    prestamoSeleccionado: PrestamoBancario | null;
};
