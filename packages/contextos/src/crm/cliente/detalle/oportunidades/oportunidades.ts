import { OportunidadVenta } from "#/crm/oportunidadventa/diseño.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Criteria, ProcesarContexto } from "@olula/lib/diseño.js";
import { accionesListaEntidades, ProcesarListaEntidades } from "@olula/lib/ListaEntidades.js";
import { getOportunidadesVentaCliente } from "../../infraestructura.ts";
import { ContextoOportunidadesCliente, EstadoOportunidadesCliente } from "./diseño.ts";

export const metaTablaOportunidades: MetaTabla<OportunidadVenta> = [
    { id: "id", cabecera: "Código" },
    { id: "descripcion", cabecera: "Descripción" },
    { id: "nombre_cliente", cabecera: "Cliente" },
    { id: "importe", cabecera: "Total", tipo: "moneda" },
    { id: "fecha_cierre", cabecera: "Fecha Cierre", tipo: "fecha" },
];

type ProcesarOportunidades = ProcesarContexto<EstadoOportunidadesCliente, ContextoOportunidadesCliente>;

type PayloadRecargaOportunidades = {
    clienteId: string;
    criteria: Criteria;
};

const conOportunidades = (fn: ProcesarListaEntidades<OportunidadVenta>) => (ctx: ContextoOportunidadesCliente) => ({ ...ctx, oportunidades: fn(ctx.oportunidades) });

export const Oportunidades = accionesListaEntidades(conOportunidades);

export const recargarOportunidades: ProcesarOportunidades = async (contexto, payload) => {
    const { clienteId, criteria } = payload as PayloadRecargaOportunidades;
    const resultado = await getOportunidadesVentaCliente(clienteId, criteria);

    return Oportunidades.recargar(contexto, resultado);
}