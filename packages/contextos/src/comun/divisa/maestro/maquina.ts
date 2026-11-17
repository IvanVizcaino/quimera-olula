import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroDivisa, EstadoMaestroDivisa } from "./diseño.ts";
import * as maestro from "./maestro.ts";

export const getMaquina: () => Maquina<EstadoMaestroDivisa, ContextoMaestroDivisa> = () => {
    return {
        INICIAL: {
            divisa_seleccionado: [maestro.Divisas.activar],
            divisa_deseleccionado: [maestro.Divisas.desactivar],

            divisa_cambiado: [maestro.Divisas.cambiar],
            divisa_borrado: [maestro.Divisas.quitar],

            recarga_de_divisas_solicitada: maestro.recargarDivisas,

            criteria_cambiado: [maestro.Divisas.filtrar, maestro.recargarDivisas],
            siguiente_pagina: [maestro.Divisas.filtrar, maestro.ampliarDivisas],

            crear_divisa_solicitado: "CREANDO",
        },

        CREANDO: {
            alta_de_divisa_cancelada: "INICIAL",
            divisa_creado: maestro.incluirDivisaCreadoPorId,
        },
    };
};
