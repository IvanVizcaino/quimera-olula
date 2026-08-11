import { ProcesarContexto } from "@olula/lib/diseño.js";
import { ejecutarListaProcesos, MetaModelo, stringNoVacio } from "@olula/lib/dominio.js";
import { pipe } from "@olula/lib/funcional.js";
import { EstadoLead } from "../diseño.ts";
import { getEstadoLead, marcarPorDefectoEstadoLead, patchEstadoLead } from "../infraestructura.ts";
import { ContextoDetalleEstadoLead, EstadoDetalleEstadoLead } from "./diseño.ts";

export const estadoLeadVacio: EstadoLead = {
    id: '',
    descripcion: '',
    valorDefecto: false,
};

export const metaEstadoLead: MetaModelo<EstadoLead> = {
    campos: {
        id: { requerido: true },
        descripcion: { requerido: true, validacion: (estado: EstadoLead) => stringNoVacio(estado.descripcion), },
        valorDefecto: { requerido: true, tipo: "checkbox" },
    },
};

type ProcesarEstadoLead = ProcesarContexto<EstadoDetalleEstadoLead, ContextoDetalleEstadoLead>;

const pipeEstadoLead = ejecutarListaProcesos<EstadoDetalleEstadoLead, ContextoDetalleEstadoLead>;

const conEstadoLead = (estado_lead: EstadoLead) => (ctx: ContextoDetalleEstadoLead) => ({ ...ctx, estado_lead });
const conEstado = (estado: EstadoDetalleEstadoLead) => (ctx: ContextoDetalleEstadoLead) => ({ ...ctx, estado });

const cargarEstadoLead: (_: string) => ProcesarEstadoLead = (id) =>
    async (contexto) => {
        const estado_lead = await getEstadoLead(id);

        return pipe(
            contexto,
            conEstadoLead(estado_lead)
        )
    }

export const refrescarEstadoLead: ProcesarEstadoLead = async (contexto) => {
    const estado_lead = await getEstadoLead(contexto.estado_lead.id);

    return [
        pipe(
            contexto,
            conEstadoLead({
                ...contexto.estado_lead,
                ...estado_lead
            })
        ),
        [["estado_lead_cambiado", estado_lead]]
    ]
}

export const cambiarEstadoLead: ProcesarEstadoLead = async (contexto, payload) => {
    const estado_lead = payload as EstadoLead;
    await patchEstadoLead(contexto.estado_lead.id, estado_lead)

    return pipeEstadoLead(contexto, [
        refrescarEstadoLead,
        "INICIAL",
    ]);
}

export const marcarPorDefecto: ProcesarEstadoLead = async (contexto, _) => {
    await marcarPorDefectoEstadoLead(contexto.estado_lead.id);

    return pipeEstadoLead(contexto, [
        refrescarEstadoLead,
        "INICIAL"
    ])
}

export const getContextoVacio: ProcesarEstadoLead = async (contexto) => {
    return pipe(
        contexto,
        conEstado("INICIAL"),
        conEstadoLead(estadoLeadVacio)
    )
}

export const cargarContexto: ProcesarEstadoLead = async (contexto, payload) => {
    const id = payload as string;

    if (!id) return getContextoVacio(contexto);

    return pipeEstadoLead(
        contexto,
        [cargarEstadoLead(id)],
        payload
    );
}
