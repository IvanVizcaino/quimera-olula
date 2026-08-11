import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroModulo, EstadoMaestroModulo } from "./diseño.js";
import * as maestro from "./maestro.js";

export const getMaquina: () => Maquina<EstadoMaestroModulo, ContextoMaestroModulo> = () => {
    return {
        INICIAL: {
            // Selección de entidades
            modulo_seleccionado: [maestro.Modulos.activar],
            modulo_deseleccionado: [maestro.Modulos.desactivar],

            // Sincronización con detalle
            modulo_cambiado: [maestro.Modulos.cambiar],
            modulo_borrado: [maestro.Modulos.quitar],

            // Recarga completa (al montar o cambiar filtros)
            recarga_de_modulos_solicitada: maestro.recargarModulos,

            // Cambio de criteria → actualiza criteria en lista y recarga desde cero
            criteria_cambiado: [maestro.Modulos.filtrar, maestro.recargarModulos],

            // Paginación incremental → actualiza criteria y añade al final de la lista
            siguiente_pagina: [maestro.Modulos.filtrar, maestro.ampliarModulos],

            // Abrir modal de creación
            crear_modulo_solicitado: "CREANDO",
        },

        CREANDO: {
            // Cancelar creación → volver al listado
            alta_de_modulo_cancelada: "INICIAL",

            // Módulo creado por el modal → obtener entidad e incluir en lista
            modulo_creado: maestro.incluirModuloCreadoPorId,
        },
    };
};
