import { Maquina } from "@olula/lib/diseño.ts";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Inventario } from "../diseño.ts";
import {
    ampliarInventarios,
    incluirInventarioCreadoPorId,
    Inventarios,
    recargarInventarios,
} from "./maestro.ts";

export type EstadoMaestroInventario = "INICIAL" | "CREANDO";

export type ContextoMaestroInventario = {
    estado: EstadoMaestroInventario;
    inventarios: ListaActivaEntidades<Inventario>;
};

export const getMaquina: () => Maquina<EstadoMaestroInventario, ContextoMaestroInventario> = () => ({
    INICIAL: {
        inventario_seleccionado: [Inventarios.activar],
        inventario_deseleccionado: [Inventarios.desactivar],
        inventario_cambiado: [Inventarios.cambiar],
        inventario_borrado: [Inventarios.quitar],
        recarga_de_inventarios_solicitada: recargarInventarios,
        criteria_cambiado: [Inventarios.filtrar, recargarInventarios],
        siguiente_pagina: [Inventarios.filtrar, ampliarInventarios],
        crear_inventario_solicitado: "CREANDO",
    },
    CREANDO: {
        alta_de_inventario_cancelada: "INICIAL",
        inventario_creado: incluirInventarioCreadoPorId,
    },
});
