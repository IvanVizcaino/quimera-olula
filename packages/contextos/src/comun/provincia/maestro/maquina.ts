import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroProvincia, EstadoMaestroProvincia } from "./diseño.ts";
import * as maestro from "./maestro.ts";

export const getMaquina: () => Maquina<EstadoMaestroProvincia, ContextoMaestroProvincia> = () => {
    return {
        INICIAL: {
            provincia_seleccionado: [maestro.Provincias.activar],
            provincia_deseleccionado: [maestro.Provincias.desactivar],

            provincia_cambiado: [maestro.Provincias.cambiar],
            provincia_borrado: [maestro.Provincias.quitar],

            recarga_de_provincias_solicitada: maestro.recargarProvincias,

            criteria_cambiado: [maestro.Provincias.filtrar, maestro.recargarProvincias],
            siguiente_pagina: [maestro.Provincias.filtrar, maestro.ampliarProvincias],

            crear_provincia_solicitado: "CREANDO",
        },

        CREANDO: {
            alta_de_provincia_cancelada: "INICIAL",
            provincia_creado: maestro.incluirProvinciaCreadoPorId,
        },
    };
};
