import { idFiscalValido, tipoIdFiscalValido } from "#/valores/idfiscal.ts";
import { ProcesarContexto } from "@olula/lib/diseño.js";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.js";
import { pipe } from "@olula/lib/funcional.js";
import { Cliente } from "../diseño.ts";
import { getCliente, patchCliente } from "../infraestructura.ts";
import { ContextoDetalleCliente, EstadoDetalleCliente } from "./diseño.ts";

export const clienteVacio = {
    id: '',
    nombre: '',
    nombre_comercial: null,
    id_fiscal: '',
    agente_id: null,
    nombre_agente: null,
    tipo_id_fiscal: '',
    grupo_iva_negocio_id: '',
    grupo_id: '',
    telefono1: '',
    telefono2: '',
    email: '',
    web: '',
    observaciones: '',
    contacto_id: '',
}

export const idFiscalValidoGeneral = (tipo: string, valor: string) => {
    return idFiscalValido(tipo)(valor) && tipoIdFiscalValido(tipo) === true;
}

export const metaCliente: MetaModelo<Cliente> = {
    campos: {
        nombre: { requerido: true },
        id_fiscal: {
            requerido: true,
            validacion: (cliente: Cliente) => idFiscalValido(cliente.tipo_id_fiscal)(cliente.id_fiscal),
        },
        tipo_id_fiscal: {
            requerido: true,
            validacion: (cliente: Cliente) => tipoIdFiscalValido(cliente.tipo_id_fiscal),
        },
        nombre_agente: { bloqueado: true },
        email: { tipo: "email" },
        telefono1: { tipo: "telefono" },
    }
};

type ProcesarCliente = ProcesarContexto<EstadoDetalleCliente, ContextoDetalleCliente>;

const pipeCliente = ejecutarListaProcesos<EstadoDetalleCliente, ContextoDetalleCliente>;

const conCliente = (cliente: Cliente) => (ctx: ContextoDetalleCliente) => ({ ...ctx, cliente });
const conEstado = (estado: EstadoDetalleCliente) => (ctx: ContextoDetalleCliente) => ({ ...ctx, estado });

const cargarCliente: (_: string) => ProcesarCliente = (id) =>
    async (contexto) => {
        const cliente = await getCliente(id);

        return pipe(
            contexto,
            conCliente(cliente)
        )
    }

export const refrescarCliente: ProcesarCliente = async (contexto) => {
    const cliente = await getCliente(contexto.cliente.id);

    return [
        pipe(
            contexto,
            conCliente({
                ...contexto.cliente,
                ...cliente
            })
        ),
        [["cliente_cambiado", cliente]]
    ]
}

export const cambiarCliente: ProcesarCliente = async (contexto, payload) => {
    const cliente = payload as Cliente;
    await patchCliente(contexto.cliente.id, cliente)

    return pipeCliente(contexto, [
        refrescarCliente,
        "INICIAL",
    ]);
}

export const getContextoVacio: ProcesarCliente = async (contexto) => {
    return pipe(
        contexto,
        conEstado("INICIAL"),
        conCliente(clienteVacio)
    )
}

export const cargarContexto: ProcesarCliente = async (contexto, payload) => {
    const id = payload as string;

    if (!id) return getContextoVacio(contexto);

    return pipeCliente(
        contexto,
        [cargarCliente(id)],
        payload
    );
}
