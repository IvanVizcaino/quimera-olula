import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroZonaGeografica, EstadoMaestroZonaGeografica } from "./diseño.ts";
import * as maestro from "./maestro.ts";

export const getMaquina: () => Maquina<EstadoMaestroZonaGeografica, ContextoMaestroZonaGeografica> = () => {
    return {
        INICIAL: {
            zona_geografica_seleccionado: [maestro.ZonasGeograficas.activar],
            zona_geografica_deseleccionado: [maestro.ZonasGeograficas.desactivar],

            zona_geografica_cambiado: [maestro.ZonasGeograficas.cambiar],
            zona_geografica_borrado: [maestro.ZonasGeograficas.quitar],

            recarga_de_zona_geograficas_solicitada: maestro.recargarZonasGeograficas,

            criteria_cambiado: [maestro.ZonasGeograficas.filtrar, maestro.recargarZonasGeograficas],
            siguiente_pagina: [maestro.ZonasGeograficas.filtrar, maestro.ampliarZonasGeograficas],

            crear_zona_geografica_solicitado: "CREANDO",
        },

        CREANDO: {
            alta_de_zona_geografica_cancelada: "INICIAL",
            zona_geografica_creado: maestro.incluirZonaGeograficaCreadoPorId,
        },
    };
};
