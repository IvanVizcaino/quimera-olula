import { Maquina } from "@olula/lib/diseño.ts";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ItemPlantillaAsiento } from "../diseño.ts";
import * as maestro from "./maestro.ts";

export type EstadoMaestroPlantillaAsiento = "INICIAL" | "CREANDO";

export type ContextoMaestroPlantillaAsiento = {
    estado: EstadoMaestroPlantillaAsiento;
    plantillas: ListaActivaEntidades<ItemPlantillaAsiento>;
};

export const getMaquina: () => Maquina<
    EstadoMaestroPlantillaAsiento,
    ContextoMaestroPlantillaAsiento
> = () => ({
    INICIAL: {
        plantilla_seleccionada: [maestro.Plantillas.activar],
        plantilla_deseleccionada: [maestro.Plantillas.desactivar],
        plantilla_cambiada: [maestro.Plantillas.cambiar],
        plantilla_borrada: [maestro.Plantillas.quitar],
        recarga_de_plantillas_solicitada: maestro.recargarPlantillas,
        criteria_cambiado: [maestro.Plantillas.filtrar, maestro.recargarPlantillas],
        siguiente_pagina: [maestro.Plantillas.filtrar, maestro.ampliarPlantillas],
        crear_plantilla_solicitada: "CREANDO",
    },
    CREANDO: {
        alta_de_plantilla_cancelada: "INICIAL",
        plantilla_creada: maestro.incluirPlantillaCreadaPorId,
    },
});
