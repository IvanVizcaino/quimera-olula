import { Maquina } from "@olula/lib/diseño.js";
import { ContextoMaestroDevolucionesPedidos, EstadoMaestroDevolucionesPedidos } from "./diseño.ts";
import {
    Devoluciones,
    ampliarDevolucionesPedidos,
    recargarDevolucionesActuales,
    recargarDevolucionesPedidos,
} from "./dominio.ts";

export const getMaquina = (): Maquina<EstadoMaestroDevolucionesPedidos, ContextoMaestroDevolucionesPedidos> => {
    return {
        INICIAL: {
            devolucion_seleccionada: Devoluciones.activar,
            devolucion_deseleccionada: Devoluciones.desactivar,
            devolucion_actualizada: [
                Devoluciones.cambiar,
                Devoluciones.desactivar,
                recargarDevolucionesActuales,
            ],
            devolucion_creada: [Devoluciones.incluir, recargarDevolucionesActuales],
            recarga_de_devoluciones_solicitada: recargarDevolucionesPedidos,
            criteria_cambiado: [Devoluciones.filtrar, recargarDevolucionesPedidos],
            siguiente_pagina: [Devoluciones.filtrar, ampliarDevolucionesPedidos],
            creacion_solicitada: "BUSCANDO_FACTURA",
        },

        BUSCANDO_FACTURA: {
            devolucion_creada: [Devoluciones.incluir, "INICIAL", recargarDevolucionesActuales],
            creacion_cancelada: "INICIAL",
        },
    };
};
