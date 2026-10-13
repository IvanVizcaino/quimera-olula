import { Maquina } from "@olula/lib/diseño.ts";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ItemModelo303 } from "../../diseño.ts";
import * as maestro from "./maestro.ts";

export type EstadoMaestroModelo303 = "INICIAL";

export type ContextoMaestroModelo303 = {
    estado: EstadoMaestroModelo303;
    modelos: ListaActivaEntidades<ItemModelo303>;
};

export const getMaquina: () => Maquina<EstadoMaestroModelo303, ContextoMaestroModelo303> = () => ({
    INICIAL: {
        modelo_seleccionado: [maestro.Modelos303.activar],
        modelo_deseleccionado: [maestro.Modelos303.desactivar],
        recarga_de_modelos_solicitada: maestro.recargarModelos303,
        criteria_cambiado: [maestro.Modelos303.filtrar, maestro.recargarModelos303],
        siguiente_pagina: [maestro.Modelos303.filtrar, maestro.ampliarModelos303],
    },
});
