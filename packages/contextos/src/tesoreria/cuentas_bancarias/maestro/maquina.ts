import { Maquina } from "@olula/lib/diseño.ts";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { CuentaBancaria } from "../diseño.js";
import * as maestro from "./maestro.js";

export type EstadoMaestroCuentaBancaria = 'INICIAL' | 'CREANDO';

export type ContextoMaestroCuentaBancaria = {
    estado: EstadoMaestroCuentaBancaria;
    cuentas: ListaActivaEntidades<CuentaBancaria>;
};

export const getMaquina: () => Maquina<EstadoMaestroCuentaBancaria, ContextoMaestroCuentaBancaria> = () => {
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
