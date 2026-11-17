import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroBanco, EstadoMaestroBanco } from "./diseño.ts";
import * as maestro from "./maestro.ts";

export const getMaquina: () => Maquina<EstadoMaestroBanco, ContextoMaestroBanco> = () => {
    return {
        INICIAL: {
            banco_seleccionado: [maestro.Bancos.activar],
            banco_deseleccionado: [maestro.Bancos.desactivar],

            banco_cambiado: [maestro.Bancos.cambiar],
            banco_borrado: [maestro.Bancos.quitar],

            recarga_de_bancos_solicitada: maestro.recargarBancos,

            criteria_cambiado: [maestro.Bancos.filtrar, maestro.recargarBancos],
            siguiente_pagina: [maestro.Bancos.filtrar, maestro.ampliarBancos],

            crear_banco_solicitado: "CREANDO",
        },

        CREANDO: {
            alta_de_banco_cancelado: "INICIAL",
            banco_creado: maestro.incluirBancoCreadoPorId,
        },
    };
};
