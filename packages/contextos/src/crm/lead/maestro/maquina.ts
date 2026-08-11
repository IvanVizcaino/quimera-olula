import { Maquina } from "@olula/lib/diseño.js";
import { ContextoMaestroLeads, EstadoMaestroLeads } from "./diseño.ts";
import { ampliarLeads, Leads, recargarLeads } from "./maestro.ts";

export const getMaquina: () => Maquina<EstadoMaestroLeads, ContextoMaestroLeads> = () => {
    return {
        INICIAL: {
            lead_cambiado: [Leads.cambiar],

            lead_seleccionado: [Leads.activar],

            lead_deseleccionado: [Leads.desactivar],

            lead_borrado: [Leads.quitar],

            recarga_de_leads_solicitada: recargarLeads,

            creacion_de_lead_solicitada: "CREANDO",

            criteria_cambiado: [Leads.filtrar, recargarLeads],

            siguiente_pagina: [Leads.filtrar, ampliarLeads],
        },
        CREANDO: {
            creacion_lead_cancelada: "INICIAL",

            lead_creado: [Leads.incluir, Leads.activar, "INICIAL"],
        }
    }
}
