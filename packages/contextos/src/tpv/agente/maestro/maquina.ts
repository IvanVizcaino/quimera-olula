import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroAgenteTpv, EstadoMaestroAgenteTpv } from "./diseño.ts";
import { Agentes, recargarAgentes } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoMaestroAgenteTpv, ContextoMaestroAgenteTpv> = () => ({
    INICIAL: {
        agente_cambiado: Agentes.cambiar,
        agente_seleccionado: [Agentes.activar],
        seleccion_cancelada: Agentes.desactivar,
        agente_borrado: async (contexto) => {
            if (!contexto.agentes.activo) return contexto;
            return Agentes.quitar(contexto, contexto.agentes.activo);
        },
        agente_creado: Agentes.incluir,
        recarga_solicitada: recargarAgentes,
        criteria_cambiado: [Agentes.filtrar, recargarAgentes],
        crear: "CREANDO",
    },
    CREANDO: {
        agente_creado: [Agentes.incluir, "INICIAL"],
        creacion_cancelada: "INICIAL",
    },
});
