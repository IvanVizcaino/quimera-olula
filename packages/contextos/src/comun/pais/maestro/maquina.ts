import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroPais, EstadoMaestroPais } from "./diseño.ts";
import * as maestro from "./maestro.ts";

export const getMaquina: () => Maquina<EstadoMaestroPais, ContextoMaestroPais> = () => {
    return {
        INICIAL: {
            pais_seleccionado: [maestro.Paises.activar],
            pais_deseleccionado: [maestro.Paises.desactivar],

            pais_cambiado: [maestro.Paises.cambiar],
            pais_borrado: [maestro.Paises.quitar],

            recarga_de_paiss_solicitada: maestro.recargarPaises,

            criteria_cambiado: [maestro.Paises.filtrar, maestro.recargarPaises],
            siguiente_pagina: [maestro.Paises.filtrar, maestro.ampliarPaises],

            crear_pais_solicitado: "CREANDO",
        },

        CREANDO: {
            alta_de_pais_cancelada: "INICIAL",
            pais_creado: maestro.incluirPaisCreadoPorId,
        },
    };
};
