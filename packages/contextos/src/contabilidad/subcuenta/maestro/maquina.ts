import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroSubcuenta, EstadoMaestroSubcuenta } from "./diseño.ts";
import * as maestro from "./maestro.ts";

export const getMaquina: () => Maquina<EstadoMaestroSubcuenta, ContextoMaestroSubcuenta> = () => {
    return {
        INICIAL: {
            subcuenta_seleccionada: [maestro.Subcuentas.activar],
            subcuenta_deseleccionada: [maestro.Subcuentas.desactivar],

            subcuenta_cambiada: [maestro.Subcuentas.cambiar],
            subcuenta_borrada: [maestro.Subcuentas.quitar],

            recarga_de_subcuentas_solicitada: maestro.recargarSubcuentas,

            criteria_cambiado: [maestro.Subcuentas.filtrar, maestro.recargarSubcuentas],
            siguiente_pagina: [maestro.Subcuentas.filtrar, maestro.ampliarSubcuentas],

            crear_subcuenta_solicitada: "CREANDO",
        },

        CREANDO: {
            alta_de_subcuenta_cancelada: "INICIAL",
            subcuenta_creada: maestro.incluirSubcuentaCreadaPorId,
        },
    };
};
