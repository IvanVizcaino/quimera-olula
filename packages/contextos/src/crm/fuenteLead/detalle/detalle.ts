import { ProcesarContexto } from "@olula/lib/diseño.js";
import { ejecutarListaProcesos, MetaModelo, stringNoVacio } from "@olula/lib/dominio.js";
import { pipe } from "@olula/lib/funcional.js";
import { FuenteLead } from "../diseño.ts";
import { getFuenteLead, marcarPorDefectoFuenteLead, patchFuenteLead } from "../infraestructura.ts";
import { ContextoDetalleFuenteLead, EstadoDetalleFuenteLead } from "./diseño.ts";

export const fuenteLeadVacia: FuenteLead = {
    id: '',
    descripcion: '',
    valorDefecto: false,
};

export const metaFuenteLead: MetaModelo<FuenteLead> = {
    campos: {
        id: { requerido: true },
        descripcion: { requerido: true, validacion: (fuente: FuenteLead) => stringNoVacio(fuente.descripcion), },
        valorDefecto: { requerido: true, tipo: "checkbox" },
    },
};

type ProcesarFuenteLead = ProcesarContexto<EstadoDetalleFuenteLead, ContextoDetalleFuenteLead>;

const pipeFuenteLead = ejecutarListaProcesos<EstadoDetalleFuenteLead, ContextoDetalleFuenteLead>;

const conFuenteLead = (fuente_lead: FuenteLead) => (ctx: ContextoDetalleFuenteLead) => ({ ...ctx, fuente_lead });
const conEstado = (estado: EstadoDetalleFuenteLead) => (ctx: ContextoDetalleFuenteLead) => ({ ...ctx, estado });

const cargarFuenteLead: (_: string) => ProcesarFuenteLead = (id) =>
    async (contexto) => {
        const fuente_lead = await getFuenteLead(id);

        return pipe(
            contexto,
            conFuenteLead(fuente_lead)
        )
    }

export const refrescarFuenteLead: ProcesarFuenteLead = async (contexto) => {
    const fuente_lead = await getFuenteLead(contexto.fuente_lead.id);

    return [
        pipe(
            contexto,
            conFuenteLead({
                ...contexto.fuente_lead,
                ...fuente_lead
            })
        ),
        [["fuente_lead_cambiada", fuente_lead]]
    ]
}

export const cambiarFuenteLead: ProcesarFuenteLead = async (contexto, payload) => {
    const fuente_lead = payload as FuenteLead;
    await patchFuenteLead(contexto.fuente_lead.id, fuente_lead)

    return pipeFuenteLead(contexto, [
        refrescarFuenteLead,
        "INICIAL",
    ]);
}

export const marcarPorDefecto: ProcesarFuenteLead = async (contexto, _) => {
    await marcarPorDefectoFuenteLead(contexto.fuente_lead.id);

    return pipeFuenteLead(contexto, [
        refrescarFuenteLead,
        "INICIAL"
    ])
}

export const getContextoVacio: ProcesarFuenteLead = async (contexto) => {
    return pipe(
        contexto,
        conEstado("INICIAL"),
        conFuenteLead(fuenteLeadVacia)
    )
}

export const cargarContexto: ProcesarFuenteLead = async (contexto, payload) => {
    const id = payload as string;

    if (!id) return getContextoVacio(contexto);

    return pipeFuenteLead(
        contexto,
        [cargarFuenteLead(id)],
        payload
    );
}
