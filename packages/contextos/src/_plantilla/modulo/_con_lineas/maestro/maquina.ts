import { Maquina } from "@olula/lib/diseño.ts";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ItemModLin } from "../diseño.js";
import * as maestro from "./maestro.js";

/**
 * Estados posibles del maestro.
 */
export type EstadoMaestroModLin = 'INICIAL' | 'CREANDO';

/**
 * Contexto del maestro (listado de módulos con líneas).
 * Usa ItemModLin (entidad ligera sin líneas) en vez de ModLin completo
 * para optimizar el listado.
 */
export type ContextoMaestroModLin = {
    estado: EstadoMaestroModLin;
    modLins: ListaActivaEntidades<ItemModLin>;
};

export const getMaquina: () => Maquina<EstadoMaestroModLin, ContextoMaestroModLin> = () => {
    return {
        INICIAL: {
            modulo_seleccionado: [maestro.ModLins.activar],
            modulo_deseleccionado: [maestro.ModLins.desactivar],
            modulo_cambiado: [maestro.ModLins.cambiar],
            modulo_borrado: [maestro.ModLins.quitar],
            recarga_de_modulos_solicitada: maestro.recargarModLins,
            criteria_cambiado: [maestro.ModLins.filtrar, maestro.recargarModLins],
            siguiente_pagina: [maestro.ModLins.filtrar, maestro.ampliarModLins],
            crear_modulo_solicitado: "CREANDO",
        },

        CREANDO: {
            alta_de_modulo_cancelada: "INICIAL",
            modulo_creado: maestro.incluirModLinCreadoPorId,
        },
    };
};
