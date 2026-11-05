import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroCuenta, EstadoMaestroCuenta } from "./diseño.ts";
import * as maestro from "./maestro.ts";

export const getMaquina: () => Maquina<EstadoMaestroCuenta, ContextoMaestroCuenta> = () => {
    return {
        INICIAL: {
            cuenta_seleccionada: [maestro.Cuentas.activar],
            cuenta_deseleccionada: [maestro.Cuentas.desactivar],

            cuenta_cambiada: [maestro.Cuentas.cambiar],
            cuenta_borrada: [maestro.Cuentas.quitar],

            recarga_de_cuentas_solicitada: maestro.recargarCuentas,

            criteria_cambiado: [maestro.Cuentas.filtrar, maestro.recargarCuentas],
            siguiente_pagina: [maestro.Cuentas.filtrar, maestro.ampliarCuentas],

            crear_cuenta_solicitada: "CREANDO",
        },

        CREANDO: {
            alta_de_cuenta_cancelada: "INICIAL",
            cuenta_creada: maestro.incluirCuentaCreadaPorId,
        },
    };
};
