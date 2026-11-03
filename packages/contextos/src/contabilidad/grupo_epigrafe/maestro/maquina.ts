import { Maquina } from "@olula/lib/diseño.ts";
import {
    ContextoMaestroGrupoEpigrafe,
    EstadoMaestroGrupoEpigrafe,
} from "./diseño.ts";
import * as maestro from "./maestro.ts";

export const getMaquina: () => Maquina<
    EstadoMaestroGrupoEpigrafe,
    ContextoMaestroGrupoEpigrafe
> = () => {
    return {
        INICIAL: {
            grupo_epigrafe_seleccionado: [maestro.Grupos.activar],
            grupo_epigrafe_deseleccionado: [maestro.Grupos.desactivar],

            grupo_epigrafe_cambiado: [maestro.Grupos.cambiar],
            grupo_epigrafe_borrado: [maestro.Grupos.quitar],

            recarga_de_grupos_solicitada: maestro.recargarGrupos,

            criteria_cambiado: [maestro.Grupos.filtrar, maestro.recargarGrupos],
            siguiente_pagina: [maestro.Grupos.filtrar, maestro.ampliarGrupos],

            crear_grupo_epigrafe_solicitado: "CREANDO",
        },

        CREANDO: {
            alta_de_grupo_epigrafe_cancelada: "INICIAL",
            grupo_epigrafe_creado: maestro.incluirGrupoCreadoPorId,
        },
    };
};
