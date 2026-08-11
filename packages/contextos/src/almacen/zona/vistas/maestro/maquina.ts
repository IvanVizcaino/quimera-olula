import { Maquina } from "@olula/lib/diseño.ts";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Zona } from "../../diseño.ts";
import { ampliarZonas, incluirZonaCreadaPorId, recargarZonas, Zonas } from "./maestro.ts";

export type EstadoMaestroZona = "INICIAL" | "CREANDO";

export type ContextoMaestroZona = {
    estado: EstadoMaestroZona;
    zonas: ListaActivaEntidades<Zona>;
};

export const getMaquina: () => Maquina<EstadoMaestroZona, ContextoMaestroZona> = () => ({
    INICIAL: {
        zona_seleccionada: [Zonas.activar],
        zona_deseleccionada: [Zonas.desactivar],
        zona_cambiada: [Zonas.cambiar],
        zona_borrada: [Zonas.quitar],
        recarga_de_zonas_solicitada: recargarZonas,
        criteria_cambiado: [Zonas.filtrar, recargarZonas],
        siguiente_pagina: [Zonas.filtrar, ampliarZonas],
        crear_zona_solicitado: "CREANDO",
    },
    CREANDO: {
        alta_de_zona_cancelada: "INICIAL",
        zona_creada: incluirZonaCreadaPorId,
    },
});
