import { Maquina } from "@olula/lib/diseño.ts";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { PickingFijo } from "../diseño.ts";
import {
    ampliarPickings,
    incluirPickingCreadoPorId,
    Pickings,
    recargarPickings,
} from "./maestro.ts";

export type EstadoMaestroPickingFijo = "INICIAL" | "CREANDO";

export type ContextoMaestroPickingFijo = {
    estado: EstadoMaestroPickingFijo;
    pickings: ListaActivaEntidades<PickingFijo>;
};

export const getMaquina: () => Maquina<EstadoMaestroPickingFijo, ContextoMaestroPickingFijo> = () => ({
    INICIAL: {
        picking_fijo_seleccionado: [Pickings.activar],
        picking_fijo_deseleccionado: [Pickings.desactivar],
        picking_fijo_cambiado: [Pickings.cambiar],
        picking_fijo_borrado: [Pickings.quitar],
        recarga_de_pickings_solicitada: recargarPickings,
        criteria_cambiado: [Pickings.filtrar, recargarPickings],
        siguiente_pagina: [Pickings.filtrar, ampliarPickings],
        crear_picking_fijo_solicitado: "CREANDO",
    },
    CREANDO: {
        alta_de_picking_fijo_cancelada: "INICIAL",
        picking_fijo_creado: incluirPickingCreadoPorId,
    },
});
