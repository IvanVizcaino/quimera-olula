import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroEventoCola, EstadoMaestroEventoCola } from "./diseño.ts";
import * as maestro from "./maestro.ts";

export const getMaquina: () => Maquina<EstadoMaestroEventoCola, ContextoMaestroEventoCola> = () => ({
    INICIAL: {
        evento_seleccionado: [maestro.Eventos.activar],
        evento_deseleccionado: [maestro.Eventos.desactivar],
        evento_reiniciado: maestro.recargarTrasReiniciar,
        recarga_de_eventos_solicitada: maestro.recargarEventos,
        criteria_cambiado: [maestro.Eventos.filtrar, maestro.recargarEventos],
        siguiente_pagina: [maestro.Eventos.filtrar, maestro.ampliarEventos],
    },
});
