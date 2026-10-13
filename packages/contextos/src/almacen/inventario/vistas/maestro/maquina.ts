import { Maquina } from "@olula/lib/diseño.ts";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ItemInventario } from "../../diseño.ts";
import * as maestro from "./maestro.ts";

export type EstadoMaestroInventario = "INICIAL" | "CREANDO" | "INVENTARIO_TOTAL";

export type ContextoMaestroInventario = {
    estado: EstadoMaestroInventario;
    inventarios: ListaActivaEntidades<ItemInventario>;
};

export const getMaquina: () => Maquina<EstadoMaestroInventario, ContextoMaestroInventario> = () => ({
    INICIAL: {
        inventario_seleccionado: [maestro.Inventarios.activar],
        inventario_deseleccionado: [maestro.Inventarios.desactivar],
        inventario_cambiado: [maestro.Inventarios.cambiar],
        recarga_de_inventarios_solicitada: maestro.recargarInventarios,
        criteria_cambiado: [maestro.Inventarios.filtrar, maestro.recargarInventarios],
        siguiente_pagina: [maestro.Inventarios.filtrar, maestro.ampliarInventarios],
        crear_inventario_solicitado: "CREANDO",
        inventario_total_solicitado: "INVENTARIO_TOTAL",
    },
    CREANDO: {
        alta_de_inventario_cancelada: "INICIAL",
        inventario_creado: maestro.incluirInventarioCreadoPorId,
    },
    INVENTARIO_TOTAL: {
        inventario_total_cancelado: "INICIAL",
        inventario_total_creado: maestro.incluirInventarioCreadoPorId,
    },
});
