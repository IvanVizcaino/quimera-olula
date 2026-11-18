import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroCodigoBalance, EstadoMaestroCodigoBalance } from "./diseño.ts";
import * as maestro from "./maestro.ts";

export const getMaquina: () => Maquina<EstadoMaestroCodigoBalance, ContextoMaestroCodigoBalance> = () => {
    return {
        INICIAL: {
            codigo_balance_seleccionado: [maestro.CodigosBalance.activar],
            codigo_balance_deseleccionado: [maestro.CodigosBalance.desactivar],

            codigo_balance_cambiado: [maestro.CodigosBalance.cambiar],
            codigo_balance_borrado: [maestro.CodigosBalance.quitar],

            recarga_de_codigos_balance_solicitada: maestro.recargarCodigosBalance,

            criteria_cambiado: [
                maestro.CodigosBalance.filtrar,
                maestro.recargarCodigosBalance,
            ],
            siguiente_pagina: [
                maestro.CodigosBalance.filtrar,
                maestro.ampliarCodigosBalance,
            ],

            crear_codigo_balance_solicitado: "CREANDO",
            regeneracion_solicitada: maestro.pedirRegeneracion,
        },

        CREANDO: {
            alta_de_codigo_balance_cancelada: "INICIAL",
            codigo_balance_creado: maestro.incluirCodigoBalanceCreadoPorId,
        },

        REGENERANDO: {
            regeneracion_cancelada: maestro.cancelarRegeneracion,
            codigos_balance_regenerados: maestro.terminarRegeneracion,
        },
    };
};
