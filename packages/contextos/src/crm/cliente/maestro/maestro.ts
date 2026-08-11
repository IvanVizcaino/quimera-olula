import { Criteria, Entidad, ProcesarContexto } from "@olula/lib/diseño.js";
import {
    ProcesarListaActivaEntidades,
    accionesListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { Cliente } from "../diseño.ts";
import { getClientes } from "../infraestructura.ts";
import { ContextoMaestroClientes, EstadoMaestroClientes } from "./diseño.ts";

export const metaTablaCliente = [
    { id: "id", cabecera: "Id" },
    { id: "nombre", cabecera: "Nombre" },
    {
        id: "id_fiscal",
        cabecera: "Id Fiscal",
        render: (entidad: Entidad) =>
            `${entidad.tipo_id_fiscal}: ${entidad.id_fiscal}`,
    },
    { id: "telefono1", cabecera: "Teléfono" },
    { id: "email", cabecera: "Email" },
];

type ProcesarClientes = ProcesarContexto<EstadoMaestroClientes, ContextoMaestroClientes>;

const conClientes =
    (fn: ProcesarListaActivaEntidades<Cliente>) =>
        (ctx: ContextoMaestroClientes) => ({ ...ctx, clientes: fn(ctx.clientes) });

export const Clientes = accionesListaActivaEntidades(conClientes);

export const recargarClientes: ProcesarClientes = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getClientes(criteria.filtro, criteria.orden, criteria.paginacion);

    return Clientes.recargar(contexto, resultado);
}

export const ampliarClientes: ProcesarClientes = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getClientes(criteria.filtro, criteria.orden, criteria.paginacion);

    return Clientes.ampliar(contexto, resultado);
}
