import { Maquina } from "@olula/lib/diseño.ts";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ItemAsiento } from "../../diseño.ts";
import * as maestro from "./maestro.ts";

export type EstadoMaestroAsiento = "INICIAL" | "CREANDO" | "RENUMERANDO";

export type ContextoMaestroAsiento = {
    estado: EstadoMaestroAsiento;
    asientos: ListaActivaEntidades<ItemAsiento>;
};

export const getMaquina: () => Maquina<EstadoMaestroAsiento, ContextoMaestroAsiento> = () => ({
    INICIAL: {
        asiento_seleccionado: [maestro.Asientos.activar],
        asiento_deseleccionado: [maestro.Asientos.desactivar],
        asiento_cambiado: [maestro.Asientos.cambiar],
        recarga_de_asientos_solicitada: maestro.recargarAsientos,
        criteria_cambiado: [maestro.Asientos.filtrar, maestro.recargarAsientos],
        siguiente_pagina: [maestro.Asientos.filtrar, maestro.ampliarAsientos],
        crear_asiento_solicitado: "CREANDO",
        renumerar_asientos_solicitado: "RENUMERANDO",
        asiento_borrado: maestro.quitarAsientoBorrado,
    },
    CREANDO: {
        alta_de_asiento_cancelada: "INICIAL",
        asiento_creado: maestro.incluirAsientoCreadoPorId,
    },
    RENUMERANDO: {
        renumeracion_cancelada: "INICIAL",
        asientos_renumerados: maestro.recargarTrasRenumeracion,
    },
});
