import { Maquina } from "@olula/lib/diseño.ts";
import {
    ContextoMaestroEpigrafe,
    EstadoMaestroEpigrafe,
} from "./diseño.ts";
import * as maestro from "./maestro.ts";

export const getMaquina: () => Maquina<
    EstadoMaestroEpigrafe,
    ContextoMaestroEpigrafe
> = () => {
    return {
        INICIAL: {
            epigrafe_seleccionado: [maestro.Epigrafes.activar],
            epigrafe_deseleccionado: [maestro.Epigrafes.desactivar],

            epigrafe_cambiado: [maestro.Epigrafes.cambiar],
            epigrafe_borrado: [maestro.Epigrafes.quitar],

            recarga_de_epigrafes_solicitada: maestro.recargarEpigrafes,

            criteria_cambiado: [
                maestro.Epigrafes.filtrar,
                maestro.recargarEpigrafes,
            ],
            siguiente_pagina: [
                maestro.Epigrafes.filtrar,
                maestro.ampliarEpigrafes,
            ],

            crear_epigrafe_solicitado: "CREANDO",
        },

        CREANDO: {
            alta_de_epigrafe_cancelada: "INICIAL",
            epigrafe_creado: maestro.incluirEpigrafeCreadoPorId,
        },
    };
};
