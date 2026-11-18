import { Maquina } from "@olula/lib/diseño.ts";
import {
    ContextoMaestroRegularizacionIva,
    EstadoMaestroRegularizacionIva,
} from "./diseño.ts";
import * as maestro from "./maestro.ts";

export const getMaquina: () => Maquina<
    EstadoMaestroRegularizacionIva,
    ContextoMaestroRegularizacionIva
> = () => {
    return {
        INICIAL: {
            regularizacion_iva_seleccionada: [maestro.Regularizaciones.activar],
            regularizacion_iva_deseleccionada: [maestro.Regularizaciones.desactivar],
            regularizacion_iva_borrada: [maestro.Regularizaciones.quitar],

            recarga_de_regularizaciones_iva_solicitada:
                maestro.recargarRegularizaciones,

            criteria_cambiado: [
                maestro.Regularizaciones.filtrar,
                maestro.recargarRegularizaciones,
            ],
            siguiente_pagina: [
                maestro.Regularizaciones.filtrar,
                maestro.ampliarRegularizaciones,
            ],

            crear_regularizacion_iva_solicitada: "CREANDO",
        },

        CREANDO: {
            alta_de_regularizacion_iva_cancelada: "INICIAL",
            regularizacion_iva_creada: maestro.incluirRegularizacionCreadaPorId,
        },
    };
};
