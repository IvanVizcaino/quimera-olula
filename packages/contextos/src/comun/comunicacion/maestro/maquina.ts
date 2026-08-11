import { Maquina } from "@olula/lib/diseño.js";
import {
    ContextoMaestroComunicacion,
    EstadoMaestroComunicacion,
} from "./diseño.ts";
import {
    ampliarComunicaciones,
    Comunicaciones,
    quitarSinAutoseleccion,
    recargarComunicaciones,
} from "./dominio.ts";

export const getMaquina: () => Maquina<
    EstadoMaestroComunicacion,
    ContextoMaestroComunicacion
> = () => {
    return {
        INICIAL: {
            comunicacion_seleccionada: [Comunicaciones.activar],
            comunicacion_cambiada: Comunicaciones.cambiar,
            comunicacion_deseleccionada: Comunicaciones.desactivar,
            comunicacion_borrada: quitarSinAutoseleccion,
            comunicacion_creada: Comunicaciones.incluir,
            recarga_de_comunicaciones_solicitada: recargarComunicaciones,
            criteria_cambiado: [Comunicaciones.filtrar, recargarComunicaciones],
            siguiente_pagina: [Comunicaciones.filtrar, ampliarComunicaciones],
            creacion_solicitada: "CREANDO_COMUNICACION",
        },

        CREANDO_COMUNICACION: {
            comunicacion_creada: [Comunicaciones.incluir, "INICIAL"],
            creacion_cancelada: "INICIAL",
        },
    };
};
