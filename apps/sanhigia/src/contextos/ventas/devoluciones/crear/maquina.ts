import { Maquina } from "@olula/lib/diseño.js";
import { ContextoCrearDevolucion, EstadoCrearDevolucion } from "./diseño.ts";
import {
    buscarFacturaProceso,
    cambiarDescripcionMotivoProceso,
    cancelarConfirmacionMotivoProceso,
    guardadoCompletadoProceso,
    guardadoFallidoProceso,
    limpiarFacturaProceso,
    seleccionarFacturaProceso,
    seleccionarMotivoProceso,
    solicitarConfirmacionMotivoProceso,
    solicitarGuardadoProceso,
    volverABusquedaProceso,
} from "./dominio.ts";

export const getMaquina = (): Maquina<EstadoCrearDevolucion, ContextoCrearDevolucion> => ({
    SELECCIONANDO_FACTURA: {
        factura_seleccionada: seleccionarFacturaProceso,
        factura_buscada: buscarFacturaProceso,
        formulario_limpiado: limpiarFacturaProceso,
    },

    EDITANDO_DEVOLUCION: {
        confirmacion_motivo_solicitada: solicitarConfirmacionMotivoProceso,
        volver_a_busqueda: volverABusquedaProceso,
        formulario_limpiado: limpiarFacturaProceso,
    },

    SELECCIONANDO_MOTIVO: {
        motivo_seleccionado: seleccionarMotivoProceso,
        descripcion_motivo_cambiada: cambiarDescripcionMotivoProceso,
        confirmacion_motivo_cancelada: cancelarConfirmacionMotivoProceso,
        guardado_solicitado: solicitarGuardadoProceso,
        guardado_completado: guardadoCompletadoProceso,
        guardado_fallido: guardadoFallidoProceso,
        formulario_limpiado: limpiarFacturaProceso,
    },

    GUARDANDO_DEVOLUCION: {
        guardado_completado: guardadoCompletadoProceso,
        guardado_fallido: guardadoFallidoProceso,
        formulario_limpiado: limpiarFacturaProceso,
    },
});
