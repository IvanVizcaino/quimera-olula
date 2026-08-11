import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroIaMemoria, EstadoMaestroIaMemoria } from "./diseño.js";
import * as maestro from "./maestro.js";

export const getMaquina: () => Maquina<EstadoMaestroIaMemoria, ContextoMaestroIaMemoria> = () => {
    return {
        INICIAL: {
            // Selección de entidades
            ia_memoria_seleccionada: [maestro.IaMemorias.activar],
            ia_memoria_deseleccionada: [maestro.IaMemorias.desactivar],

            // Sincronización con detalle
            ia_memoria_cambiada: [maestro.IaMemorias.cambiar],
            ia_memoria_borrada: [maestro.IaMemorias.quitar],

            // Recarga completa (al montar o cambiar filtros)
            recarga_solicitada: maestro.recargarIaMemorias,

            // Cambio de criteria → actualiza criteria en lista y recarga desde cero
            criteria_cambiado: [maestro.IaMemorias.filtrar, maestro.recargarIaMemorias],

            // Paginación incremental → actualiza criteria y añade al final de la lista
            siguiente_pagina: [maestro.IaMemorias.filtrar, maestro.ampliarIaMemorias],

            // Abrir modal de creación
            creacion_solicitada: "CREANDO",
        },

        CREANDO: {
            // Cancelar creación → volver al listado
            alta_cancelada: "INICIAL",

            // Memoria creada por el modal → obtener entidad e incluir en lista
            ia_memoria_creada: maestro.incluirIaMemoriaCreadaPorId,
        },
    };
};
