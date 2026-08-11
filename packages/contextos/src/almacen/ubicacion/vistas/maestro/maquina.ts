import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroUbicacion, EstadoMaestroUbicacion } from "./diseño.ts";
import { Ubicaciones, ampliarUbicaciones, recargarUbicaciones } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoMaestroUbicacion, ContextoMaestroUbicacion> = () => ({
    INICIAL: {
        ubicacion_seleccionada: [Ubicaciones.activar],
        ubicacion_deseleccionada: [Ubicaciones.desactivar],
        ubicacion_cambiada: [Ubicaciones.cambiar],
        ubicacion_borrada: async (contexto) => {
            if (!contexto.ubicaciones.activo) {
                return contexto;
            }
            return Ubicaciones.quitar(contexto, contexto.ubicaciones.activo);
        },
        ubicacion_creada: [Ubicaciones.incluir],
        recarga_de_ubicaciones_solicitada: recargarUbicaciones,
        criteria_cambiado: [Ubicaciones.filtrar, recargarUbicaciones],
        siguiente_pagina: [Ubicaciones.filtrar, ampliarUbicaciones],
        crear: "CREANDO",
    },
    CREANDO: {
        ubicacion_creada: [Ubicaciones.incluir, "INICIAL"],
        creacion_cancelada: "INICIAL",
    },
});
