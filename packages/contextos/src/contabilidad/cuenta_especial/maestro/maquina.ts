import { Maquina } from "@olula/lib/diseño.ts";
import {
    ContextoMaestroCuentaEspecial,
    EstadoMaestroCuentaEspecial,
} from "./diseño.ts";
import * as maestro from "./maestro.ts";

export const getMaquina: () => Maquina<
    EstadoMaestroCuentaEspecial,
    ContextoMaestroCuentaEspecial
> = () => {
    return {
        INICIAL: {
            cuenta_especial_seleccionada: [maestro.CuentasEspeciales.activar],
            cuenta_especial_deseleccionada: [
                maestro.CuentasEspeciales.desactivar,
            ],

            cuenta_especial_cambiada: [maestro.CuentasEspeciales.cambiar],
            cuenta_especial_borrada: [maestro.CuentasEspeciales.quitar],

            recarga_de_cuentas_especiales_solicitada:
                maestro.recargarCuentasEspeciales,

            criteria_cambiado: [
                maestro.CuentasEspeciales.filtrar,
                maestro.recargarCuentasEspeciales,
            ],
            siguiente_pagina: [
                maestro.CuentasEspeciales.filtrar,
                maestro.ampliarCuentasEspeciales,
            ],

            crear_cuenta_especial_solicitada: "CREANDO",
        },

        CREANDO: {
            alta_de_cuenta_especial_cancelada: "INICIAL",
            cuenta_especial_creada: maestro.incluirCuentaEspecialCreadaPorId,
        },
    };
};
