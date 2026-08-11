import { Maquina } from "@olula/lib/diseño.js";
import {
    ContextoMaestroMotivoDevolucion,
    EstadoMaestroMotivoDevolucion,
} from "./diseño.ts";
import {
    ampliarMotivosDevolucion,
    cambiarOtro,
    MotivosDevolucion,
    recargarMotivosDevolucion,
} from "./dominio.ts";

export const getMaquina: () => Maquina<
    EstadoMaestroMotivoDevolucion,
    ContextoMaestroMotivoDevolucion
> = () => ({
    INICIAL: {
        motivo_devolucion_cambiado: [MotivosDevolucion.cambiar],
        motivo_devolucion_seleccionado: [MotivosDevolucion.activar],
        motivo_devolucion_deseleccionado: MotivosDevolucion.desactivar,
        motivo_devolucion_borrado: MotivosDevolucion.quitar,
        recarga_de_motivos_devolucion_solicitada: recargarMotivosDevolucion,
        criteria_cambiado: [
            MotivosDevolucion.filtrar,
            recargarMotivosDevolucion,
        ],
        siguiente_pagina: [MotivosDevolucion.filtrar, ampliarMotivosDevolucion],
        creacion_motivo_devolucion_solicitada: "CREANDO_MOTIVO_DEVOLUCION",
        cambiar_otro_solicitado: cambiarOtro,
    },
    CREANDO_MOTIVO_DEVOLUCION: {
        creacion_motivo_devolucion_cancelada: "INICIAL",
        motivo_devolucion_creado: [
            MotivosDevolucion.incluir,
            MotivosDevolucion.activar,
            "INICIAL",
        ],
    },
});