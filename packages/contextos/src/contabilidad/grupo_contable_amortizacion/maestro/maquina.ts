import { Maquina } from "@olula/lib/diseño.ts";
import {
    ContextoMaestroGrupoContableAmortizacion,
    EstadoMaestroGrupoContableAmortizacion,
} from "./diseño.ts";
import * as maestro from "./maestro.ts";

export const getMaquina: () => Maquina<
    EstadoMaestroGrupoContableAmortizacion,
    ContextoMaestroGrupoContableAmortizacion
> = () => {
    return {
        INICIAL: {
            grupo_seleccionado: [maestro.Grupos.activar],
            grupo_deseleccionado: [maestro.Grupos.desactivar],

            grupo_cambiado: [maestro.Grupos.cambiar],
            grupo_borrado: [maestro.Grupos.quitar],

            recarga_de_grupos_solicitada: maestro.recargarGrupos,

            criteria_cambiado: [maestro.Grupos.filtrar, maestro.recargarGrupos],
            siguiente_pagina: [maestro.Grupos.filtrar, maestro.ampliarGrupos],

            crear_grupo_solicitado: "CREANDO",
        },

        CREANDO: {
            alta_de_grupo_cancelada: "INICIAL",
            grupo_creado: maestro.incluirGrupoCreadoPorId,
        },
    };
};
