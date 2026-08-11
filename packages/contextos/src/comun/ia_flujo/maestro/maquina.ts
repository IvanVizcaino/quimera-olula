import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroIaFlujo, EstadoMaestroIaFlujo } from "./diseño.js";
import * as maestro from "./maestro.js";

export const getMaquina: () => Maquina<EstadoMaestroIaFlujo, ContextoMaestroIaFlujo> = () => {
    return {
        INICIAL: {
            // Selección de entidades
            ia_flujo_seleccionado: [maestro.IaFlujos.activar],
            ia_flujo_deseleccionado: [maestro.IaFlujos.desactivar],

            // Sincronización con detalle
            ia_flujo_cambiado: [maestro.IaFlujos.cambiar],
            ia_flujo_borrado: [maestro.IaFlujos.quitar],

            // Recarga completa (al montar o cambiar filtros)
            recarga_solicitada: maestro.recargarIaFlujos,

            // Cambio de criteria → actualiza criteria en lista y recarga desde cero
            criteria_cambiado: [maestro.IaFlujos.filtrar, maestro.recargarIaFlujos],

            // Paginación incremental → actualiza criteria y añade al final de la lista
            siguiente_pagina: [maestro.IaFlujos.filtrar, maestro.ampliarIaFlujos],

            // Abrir modal de creación
            creacion_solicitada: "CREANDO",
        },

        CREANDO: {
            // Cancelar creación → volver al listado
            alta_cancelada: "INICIAL",

            // Flujo creado por el modal → obtener entidad e incluir en lista
            ia_flujo_creado: maestro.incluirIaFlujoCreadoPorId,
        },
    };
};
