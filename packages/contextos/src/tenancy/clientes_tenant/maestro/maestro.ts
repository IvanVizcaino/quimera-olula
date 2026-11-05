import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ClienteTenant } from "../diseño.js";
import { getClienteTenant, getClientesTenant } from "../infraestructura.js";
import { ContextoMaestroClienteTenant, EstadoMaestroClienteTenant } from "./diseño.js";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroClienteTenant, ContextoMaestroClienteTenant>;

const conClientes = (fn: ProcesarListaActivaEntidades<ClienteTenant>) =>
    (ctx: ContextoMaestroClienteTenant) => ({ ...ctx, clientes: fn(ctx.clientes) });

export const Clientes = accionesListaActivaEntidades(conClientes);

export const recargarClientes: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getClientesTenant(criteria);
    return Clientes.recargar(contexto, resultado);
};

export const ampliarClientes: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getClientesTenant(criteria);
    return Clientes.ampliar(contexto, resultado);
};

export const incluirClienteCreadoPorId: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const cliente = await getClienteTenant(id);
    return {
        ...contexto,
        estado: "INICIAL" as EstadoMaestroClienteTenant,
        clientes: {
            ...contexto.clientes,
            lista: [cliente, ...contexto.clientes.lista],
            total: contexto.clientes.total + 1,
            activo: cliente.id,
        },
    };
};
