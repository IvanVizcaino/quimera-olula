import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroReciboCompra, EstadoMaestroReciboCompra } from "./diseño.js";
import * as maestro from "./maestro.js";

export const getMaquina: () => Maquina<EstadoMaestroReciboCompra, ContextoMaestroReciboCompra> = () => {
    return {
        INICIAL: {
            recibo_seleccionado: [maestro.Recibos.activar],
            recibo_deseleccionado: [maestro.Recibos.desactivar],

            recarga_de_recibos_solicitada: maestro.recargarRecibos,

            criteria_cambiado: [maestro.Recibos.filtrar, maestro.recargarRecibos],

            siguiente_pagina: [maestro.Recibos.filtrar, maestro.ampliarRecibos],

            seleccionados_cambiados: maestro.seleccionadosCambiados,
            remesado_solicitado: "REMESANDO",
        },

        REMESANDO: {
            remesado_confirmado: maestro.remesarSeleccionados,
            remesado_cancelado: "INICIAL",
        },
    };
};
