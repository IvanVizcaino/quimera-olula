import { Maquina } from "@olula/lib/diseño.ts";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { TipoUbicacion } from "../diseño.ts";
import {
    ampliarTiposUbicacion,
    incluirTipoUbicacionCreadoPorId,
    recargarTiposUbicacion,
    TiposUbicacion,
} from "./maestro.ts";

export type EstadoMaestroTipoUbicacion = "INICIAL" | "CREANDO";

export type ContextoMaestroTipoUbicacion = {
    estado: EstadoMaestroTipoUbicacion;
    tiposUbicacion: ListaActivaEntidades<TipoUbicacion>;
};

export const getMaquina: () => Maquina<EstadoMaestroTipoUbicacion, ContextoMaestroTipoUbicacion> = () => ({
    INICIAL: {
        tipo_ubicacion_seleccionado: [TiposUbicacion.activar],
        tipo_ubicacion_deseleccionado: [TiposUbicacion.desactivar],
        tipo_ubicacion_cambiado: [TiposUbicacion.cambiar],
        tipo_ubicacion_borrado: [TiposUbicacion.quitar],
        recarga_de_tipos_ubicacion_solicitada: recargarTiposUbicacion,
        criteria_cambiado: [TiposUbicacion.filtrar, recargarTiposUbicacion],
        siguiente_pagina: [TiposUbicacion.filtrar, ampliarTiposUbicacion],
        crear_tipo_ubicacion_solicitado: "CREANDO",
    },
    CREANDO: {
        alta_de_tipo_ubicacion_cancelada: "INICIAL",
        tipo_ubicacion_creado: incluirTipoUbicacionCreadoPorId,
    },
});
