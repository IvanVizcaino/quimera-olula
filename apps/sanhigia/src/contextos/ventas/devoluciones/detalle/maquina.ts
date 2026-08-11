import { Maquina } from "@olula/lib/diseño.js";
import {
    ContextoDetalleDevolucionPedido,
    EstadoDetalleDevolucionPedido,
} from "./diseño.ts";
import {
    cambiarCantidadKoDetalleDevolucionPedido,
    cambiarCantidadOkDetalleDevolucionPedido,
    cancelarConfirmacionPrepararDetalleDevolucionPedido,
    cargarDetalleDevolucionPedido,
    limpiarCantidadesDetalleDevolucionPedido,
    prepararDetalleDevolucionPedido,
    solicitarConfirmacionPrepararDetalleDevolucionPedido,
} from "./dominio.ts";

export const getMaquina = (): Maquina<
    EstadoDetalleDevolucionPedido,
    ContextoDetalleDevolucionPedido
> => ({
    INICIAL: {
        id_cambiado: cargarDetalleDevolucionPedido,
    },
    ABIERTO: {
        id_cambiado: cargarDetalleDevolucionPedido,
        cantidad_ok_cambiada: cambiarCantidadOkDetalleDevolucionPedido,
        cantidad_ko_cambiada: cambiarCantidadKoDetalleDevolucionPedido,
        cantidades_limpiadas: limpiarCantidadesDetalleDevolucionPedido,
        confirmacion_preparar_solicitada:
            solicitarConfirmacionPrepararDetalleDevolucionPedido,
        devolucion_preparada: prepararDetalleDevolucionPedido,
    },
    CONFIRMANDO_PREPARAR: {
        id_cambiado: cargarDetalleDevolucionPedido,
        cantidad_ok_cambiada: cambiarCantidadOkDetalleDevolucionPedido,
        cantidad_ko_cambiada: cambiarCantidadKoDetalleDevolucionPedido,
        cantidades_limpiadas: limpiarCantidadesDetalleDevolucionPedido,
        confirmacion_preparar_cancelada:
            cancelarConfirmacionPrepararDetalleDevolucionPedido,
        devolucion_preparada: prepararDetalleDevolucionPedido,
    },
});
