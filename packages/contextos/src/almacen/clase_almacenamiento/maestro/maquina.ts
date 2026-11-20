import { Maquina } from "@olula/lib/diseño.ts";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ClaseAlmacenamiento } from "../diseño.ts";
import {
    ampliarClases,
    Clases,
    incluirClaseCreadaPorId,
    recargarClases,
} from "./maestro.ts";

export type EstadoMaestroClaseAlmacenamiento = "INICIAL" | "CREANDO";

export type ContextoMaestroClaseAlmacenamiento = {
    estado: EstadoMaestroClaseAlmacenamiento;
    clases: ListaActivaEntidades<ClaseAlmacenamiento>;
};

export const getMaquina: () => Maquina<EstadoMaestroClaseAlmacenamiento, ContextoMaestroClaseAlmacenamiento> = () => ({
    INICIAL: {
        clase_almacenamiento_seleccionada: [Clases.activar],
        clase_almacenamiento_deseleccionada: [Clases.desactivar],
        clase_almacenamiento_cambiada: [Clases.cambiar],
        clase_almacenamiento_borrada: [Clases.quitar],
        recarga_de_clases_solicitada: recargarClases,
        criteria_cambiado: [Clases.filtrar, recargarClases],
        siguiente_pagina: [Clases.filtrar, ampliarClases],
        crear_clase_almacenamiento_solicitado: "CREANDO",
    },
    CREANDO: {
        alta_de_clase_almacenamiento_cancelada: "INICIAL",
        clase_almacenamiento_creada: incluirClaseCreadaPorId,
    },
});
