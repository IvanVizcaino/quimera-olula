import { ProcesarContexto } from "@olula/lib/diseño.js";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.js";
import { pipe } from "@olula/lib/funcional.js";
import { Lead } from "../diseño.ts";
import { getLead, patchLead } from "../infraestructura.ts";
import { ContextoDetalleLead, EstadoDetalleLead } from "./diseño.ts";

export const leadVacio: Lead = {
    id: "",
    tipo: "Cliente",
    estado_id: "",
    estado: "",
    nombre: "",
    id_fiscal: "",
    cliente_id: "",
    proveedor_id: "",
    direccion: "",
    cod_postal: "",
    ciudad: "",
    provincia_id: null,
    provincia: "",
    pais_id: "",
    pais: "",
    telefono_1: "",
    telefono_2: "",
    email: "",
    web: "",
    contacto_id: "",
    fuente_id: "",
    fuente: "",
    responsable_id: "",
};

export const metaLead: MetaModelo<Lead> = {
    campos: {
        tipo: { requerido: true, bloqueado: true },
        estado_id: { requerido: true },
        nombre: { requerido: true },
        id_fiscal: { requerido: false },
        cliente_id: { requerido: false },
        proveedor_id: { requerido: false },
        direccion: { requerido: false },
        cod_postal: { requerido: false },
        ciudad: { requerido: false },
        provincia_id: { requerido: false },
        provincia: { requerido: false },
        pais_id: { requerido: false },
        pais: { requerido: false },
        telefono_1: { requerido: false },
        telefono_2: { requerido: false },
        email: { requerido: false, tipo: "email" },
        web: { requerido: false },
        contacto_id: { requerido: false, tipo: "autocompletar" },
        fuente_id: { requerido: true },
        responsable_id: { requerido: false },
    },
};

type ProcesarLead = ProcesarContexto<EstadoDetalleLead, ContextoDetalleLead>;

const pipeLead = ejecutarListaProcesos<EstadoDetalleLead, ContextoDetalleLead>;

const conLead = (lead: Lead) => (ctx: ContextoDetalleLead) => ({ ...ctx, lead });
const conEstado = (estado: EstadoDetalleLead) => (ctx: ContextoDetalleLead) => ({ ...ctx, estado });

const cargarLead: (_: string) => ProcesarLead = (id) =>
    async (contexto) => {
        const lead = await getLead(id);

        return pipe(
            contexto,
            conLead(lead)
        )
    }

export const refrescarLead: ProcesarLead = async (contexto) => {
    const lead = await getLead(contexto.lead.id);

    return [
        pipe(
            contexto,
            conLead({
                ...contexto.lead,
                ...lead
            })
        ),
        [["lead_cambiado", lead]]
    ]
}

export const cambiarLead: ProcesarLead = async (contexto, payload) => {
    const lead = payload as Lead;
    await patchLead(contexto.lead.id, lead)

    return pipeLead(contexto, [
        refrescarLead,
        "INICIAL",
    ]);
}

export const getContextoVacio: ProcesarLead = async (contexto) => {
    return pipe(
        contexto,
        conEstado("INICIAL"),
        conLead(leadVacio)
    )
}

export const cargarContexto: ProcesarLead = async (contexto, payload) => {
    const id = payload as string;

    if (!id) return getContextoVacio(contexto);

    return pipeLead(
        contexto,
        [cargarLead(id)],
        payload
    );
}
