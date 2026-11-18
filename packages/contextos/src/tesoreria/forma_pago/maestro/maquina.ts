import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroFormaPago, EstadoMaestroFormaPago } from "./diseño.ts";
import * as maestro from "./maestro.ts";

export const getMaquina: () => Maquina<EstadoMaestroFormaPago, ContextoMaestroFormaPago> = () => {
    return {
        INICIAL: {
            forma_pago_seleccionada: [maestro.FormasPago.activar],
            forma_pago_deseleccionada: [maestro.FormasPago.desactivar],

            forma_pago_cambiada: [maestro.FormasPago.cambiar],
            forma_pago_borrada: [maestro.FormasPago.quitar],

            recarga_de_formas_pago_solicitada: maestro.recargarFormasPago,

            criteria_cambiado: [maestro.FormasPago.filtrar, maestro.recargarFormasPago],
            siguiente_pagina: [maestro.FormasPago.filtrar, maestro.ampliarFormasPago],

            crear_forma_pago_solicitada: "CREANDO",
        },

        CREANDO: {
            alta_de_forma_pago_cancelada: "INICIAL",
            forma_pago_creada: maestro.incluirFormaPagoCreadaPorId,
        },
    };
};
