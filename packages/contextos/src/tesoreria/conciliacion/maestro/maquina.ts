import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroConciliacion, EstadoMaestroConciliacion } from "./diseño.js";
import * as maestro from "./maestro.js";

export const getMaquina: () => Maquina<EstadoMaestroConciliacion, ContextoMaestroConciliacion> = () => {
    return {
        INICIAL: {
            movimiento_seleccionado: [maestro.Movimientos.activar],
            movimiento_deseleccionado: [maestro.Movimientos.desactivar],

            movimiento_cambiado: [maestro.aplicarMovimientoCambiado],

            // Emitido por detalle/detalle.ts (onDesconciliado) cuando el banco
            // ya había retirado el movimiento y desconciliar lo borra del todo.
            movimiento_borrado: [maestro.aplicarMovimientoBorrado],

            recarga_de_movimientos_solicitada: maestro.recargarMovimientos,

            criteria_cambiado: [maestro.Movimientos.filtrar, maestro.recargarMovimientos],

            siguiente_pagina: [maestro.Movimientos.filtrar, maestro.ampliarMovimientos],

            resumen_sincronizacion_cerrado: [maestro.cerrarResumenSincronizacion],

            // Transición síncrona: se refleja de inmediato en ctx.estado, así el
            // botón "Sincronizar" se deshabilita antes de que arranque la petición.
            sincronizacion_solicitada: "SINCRONIZANDO",

            resumen_conciliacion_automatica_cerrado: [maestro.cerrarResumenConciliacionAutomatica],

            conciliacion_automatica_solicitada: "CONCILIANDO_AUTOMATICAMENTE",

            filtro_cuadre_establecido: [maestro.establecerFiltroCuadre],
            filtro_cuadre_limpiado: [maestro.limpiarFiltroCuadre],
        },

        SINCRONIZANDO: {
            // Emitido por SincronizarMovimientoBancario.tsx al terminar la petición.
            sincronizacion_completada: [maestro.aplicarResumenSincronizacion],

            sincronizacion_cancelada: "INICIAL",
        },

        CONCILIANDO_AUTOMATICAMENTE: {
            // Emitido por ConciliarAutomaticamenteMovimientos.tsx al terminar la petición.
            conciliacion_automatica_completada: [maestro.aplicarResumenConciliacionAutomatica],

            conciliacion_automatica_cancelada: "INICIAL",
        },
    };
};
