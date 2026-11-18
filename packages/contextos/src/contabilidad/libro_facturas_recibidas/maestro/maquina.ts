import { Maquina } from "@olula/lib/diseño.ts";
import {
    ContextoMaestroLibroFacturasRecibidas,
    EstadoMaestroLibroFacturasRecibidas,
} from "./diseño.ts";
import * as maestro from "./maestro.ts";

export const getMaquina: () => Maquina<
    EstadoMaestroLibroFacturasRecibidas,
    ContextoMaestroLibroFacturasRecibidas
> = () => {
    return {
        INICIAL: {
            informe_seleccionado: [maestro.Informes.activar],
            informe_deseleccionado: [maestro.Informes.desactivar],

            informe_cambiado: [maestro.Informes.cambiar],
            informe_borrado: [maestro.Informes.quitar],

            recarga_de_informes_solicitada: maestro.recargarInformes,

            criteria_cambiado: [
                maestro.Informes.filtrar,
                maestro.recargarInformes,
            ],
            siguiente_pagina: [
                maestro.Informes.filtrar,
                maestro.ampliarInformes,
            ],

            crear_informe_solicitado: "CREANDO",
        },

        CREANDO: {
            alta_de_informe_cancelada: "INICIAL",
            informe_creado: maestro.incluirInformeCreadoPorId,
        },
    };
};
