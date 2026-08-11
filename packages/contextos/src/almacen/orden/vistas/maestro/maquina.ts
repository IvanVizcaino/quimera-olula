import { Maquina } from "@olula/lib/diseño.ts";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ItemOrdenAlmacen } from "../../diseño.ts";
import * as maestro from "./maestro.js";

export type EstadoMaestroOrden = 'INICIAL' | 'CREANDO';

export type ContextoMaestroOrden = {
    estado: EstadoMaestroOrden;
    ordenes: ListaActivaEntidades<ItemOrdenAlmacen>;
};

export const getMaquina: () => Maquina<EstadoMaestroOrden, ContextoMaestroOrden> = () => {
    return {
        INICIAL: {
            orden_seleccionada: [maestro.Ordenes.activar],
            cancelar_seleccion: [maestro.Ordenes.desactivar],
            orden_cambiada: [maestro.Ordenes.cambiar],
            orden_borrada: [maestro.Ordenes.quitar],
            recarga_solicitada: maestro.recargarOrdenes,
            criteria_cambiado: [maestro.Ordenes.filtrar, maestro.recargarOrdenes],
            siguiente_pagina: [maestro.Ordenes.filtrar, maestro.ampliarOrdenes],
            crear_modulo_solicitado: "CREANDO",
        },

        CREANDO: {
            alta_de_modulo_cancelada: "INICIAL",
            modulo_creado: maestro.incluirOrdenCreadaPorId,
        },
    };
};
