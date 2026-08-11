import { OportunidadVenta } from "#/crm/oportunidadventa/diseño.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Criteria, ProcesarContexto } from "@olula/lib/diseño.js";
import { accionesListaEntidades, ProcesarListaEntidades } from "@olula/lib/ListaEntidades.js";
import { getOportunidadesVentaLead } from "../../infraestructura.ts";
import { ContextoOportunidadesLead, EstadoOportunidadesLead } from "./diseño.ts";

export const metaTablaOportunidades: MetaTabla<OportunidadVenta> = [
    { id: "id", cabecera: "Código" },
    { id: "descripcion", cabecera: "Descripción" },
    { id: "nombre_cliente", cabecera: "Cliente" },
    { id: "importe", cabecera: "Total", tipo: "moneda" },
    { id: "fecha_cierre", cabecera: "Fecha Cierre", tipo: "fecha" },
];

type ProcesarOportunidades = ProcesarContexto<EstadoOportunidadesLead, ContextoOportunidadesLead>;

type PayloadRecargaOportunidades = {
    leadId: string;
    criteria: Criteria;
};

const conOportunidades = (fn: ProcesarListaEntidades<OportunidadVenta>) => (ctx: ContextoOportunidadesLead) => ({ ...ctx, oportunidades: fn(ctx.oportunidades) });

export const Oportunidades = accionesListaEntidades(conOportunidades);

export const recargarOportunidades: ProcesarOportunidades = async (contexto, payload) => {
    const { leadId, criteria } = payload as PayloadRecargaOportunidades;
    const resultado = await getOportunidadesVentaLead(leadId, criteria);

    return Oportunidades.recargar(contexto, resultado);
}