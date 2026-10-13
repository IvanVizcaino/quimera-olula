import { MovimientoReciboCompra, ReciboCompra } from "./diseño.ts";

/**
 * Estados en los que el recibo admite pago manual. El servidor manda el estado como
 * texto libre («Emitido» = pendiente), así que se compara sin mayúsculas.
 */
const ESTADOS_PAGABLES = ["emitido", "devuelto"];

export const reciboCompraPagable = (recibo: { estado: string }): boolean =>
    ESTADOS_PAGABLES.includes(recibo.estado.trim().toLowerCase());

/** Solo un recibo pagado admite devolución. */
export const reciboCompraDevolvible = (recibo: ReciboCompra): boolean =>
    recibo.estado.trim().toLowerCase() === "pagado";

/** Solo un recibo pagado con pagos conocidos admite anulación de pago. */
export const reciboCompraAnulable = (recibo: ReciboCompra): boolean =>
    recibo.pagos.length > 0 &&
    recibo.estado.trim().toLowerCase() === "pagado";

const esDevolucion = (movimiento: MovimientoReciboCompra): boolean =>
    movimiento.tipo.trim().toLowerCase().startsWith("devol");

/**
 * Cuenta del último pago del recibo. La devolución tiene que salir
 * por la misma cuenta por la que se pagó.
 */
export const cuentaUltimoPagoCompra = (
    recibo: ReciboCompra
): { id: string; nombre: string } | null => {
    const pagos = recibo.pagos
        .filter((m) => !esDevolucion(m))
        .sort((a, b) => (a.fecha?.getTime() ?? 0) - (b.fecha?.getTime() ?? 0));
    const ultimo = pagos[pagos.length - 1];

    return ultimo?.cuentaPagoId
        ? { id: ultimo.cuentaPagoId, nombre: ultimo.nombreCuentaPago }
        : null;
};

/** Devuelve el último pago registrado (el que se anularía). */
export const ultimoPagoCompra = (
    recibo: ReciboCompra
): MovimientoReciboCompra | null => {
    const pagos = [...recibo.pagos].sort(
        (a, b) => (a.fecha?.getTime() ?? 0) - (b.fecha?.getTime() ?? 0)
    );
    return pagos[pagos.length - 1] ?? null;
};
