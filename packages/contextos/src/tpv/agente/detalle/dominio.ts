import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.ts";
import { AgenteTpv } from "../diseño.ts";
import { getAgenteTpv } from "../infraestructura.ts";
import { ContextoAgenteTpv, EstadoAgenteTpv } from "./diseño.ts";

type ProcesarAgenteTpv = ProcesarContexto<EstadoAgenteTpv, ContextoAgenteTpv>;

export const agenteVacioDetalle = (): AgenteTpv => ({
    id: "",
    nombre: "",
});

export const metaAgenteTpv: MetaModelo<AgenteTpv> = {
    campos: {
        nombre: {
            requerido: true,
            validacion: (m: AgenteTpv) => stringNoVacio(m.nombre),
        },
    },
};

export const cargarContexto: ProcesarAgenteTpv = async (contexto, payload) => {
    const id = payload as string;
    if (!id) {
        const vacia = agenteVacioDetalle();
        return { ...contexto, estado: "INICIAL", agente: vacia, agenteInicial: vacia };
    }
    const agente = await getAgenteTpv(id);
    return { ...contexto, estado: "Editando", agente, agenteInicial: agente };
};

export const refrescarAgente: ProcesarAgenteTpv = async (contexto) => {
    const agente = await getAgenteTpv(contexto.agente.id);
    return [
        { ...contexto, agente },
        [["agente_cambiado", agente]],
    ];
};

export const cancelarEdicion: ProcesarAgenteTpv = async (ctx) => ({
    ...ctx,
    agente: ctx.agenteInicial,
});
