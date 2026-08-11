import { idFiscalValido, tipoIdFiscalValido } from "#/valores/idfiscal.ts";
import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo, publicar } from "@olula/lib/dominio.js";
import { Cliente } from "../diseño.ts";
import {
    asignarCuentaRemesa,
    darDeAltaCliente,
    darDeBajaCliente,
    getCliente,
    patchCliente
} from "../infraestructura.ts";
import { ContextoCliente, EstadoCliente } from "./diseño.ts";

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
        fecha_baja: { tipo: "fecha" },
        telefono1: { tipo: "telefono" },
    }
};


export const clienteVacio = (): Cliente => ({
    id: '',
    nombre: '',
    nombre_comercial: null,
    id_fiscal: '',
    agente_id: null,
    nombre_agente: null,
    divisa_id: '',
    tipo_id_fiscal: '',
    serie_id: '',
    forma_pago_id: '',
    grupo_iva_negocio_id: '',
    de_baja: false,
    fecha_baja: null,
    grupo_id: '',
    telefono1: '',
    telefono2: '',
    email: '',
    web: '',
    observaciones: '',
    copiasfactura: 0,
    fechabaja: '',
    contacto_id: '',
    cuenta_domiciliada: '',
    descripcion_cuenta: '',
    cuenta_remesa: '',
    descripcion_cuenta_remesa: '',
    debaja: false,
    forma_pago: '',
    divisa: '',
    grupo_iva_negocio: '',
    serie: '',
    grupo: '',
})


type ProcesarCliente = ProcesarContexto<EstadoCliente, ContextoCliente>;

const pipeCliente = ejecutarListaProcesos<EstadoCliente, ContextoCliente>;

export const clienteVacioContexto = (): Cliente => ({ ...clienteVacio() });

const cargarCliente: (_: string) => ProcesarCliente = (idCliente) =>
    async (contexto) => {
        const cliente = await getCliente(idCliente);
        return {
            ...contexto,
            cliente,
            clienteInicial: cliente,
        }
    }

export const refrescarCliente: ProcesarCliente = async (contexto) => {
    const cliente = await getCliente(contexto.cliente.id);
    return [
        {
            ...contexto,
            cliente: {
                ...contexto.cliente,
                ...cliente
            },
        },
        [["cliente_cambiado", cliente]]
    ]
}

export const cancelarCambioCliente: ProcesarCliente = async (contexto) => {
    return {
        ...contexto,
        cliente: contexto.clienteInicial
    }
}

export const abiertoContexto: ProcesarCliente = async (contexto) => {
    return {
        ...contexto,
        estado: "ABIERTO"
    }
}

export const getContextoVacio: ProcesarCliente = async (contexto) => {
    return {
        ...contexto,
        estado: 'INICIAL',
        cliente: clienteVacioContexto(),
        clienteInicial: clienteVacioContexto(),
    }
}

export const cargarContexto: ProcesarCliente = async (contexto, payload) => {
    const idCliente = payload as string;
    if (idCliente) {
        return pipeCliente(
            contexto,
            [
                cargarCliente(idCliente),
                abiertoContexto,
            ],
            payload
        );
    } else {
        return getContextoVacio(contexto);
    }
}

export const cambiarCliente: ProcesarCliente = async (contexto, payload) => {
    const cliente = payload as Cliente;
    await patchCliente(contexto.cliente.id, cliente);

    return pipeCliente(contexto, [
        refrescarCliente,
        'ABIERTO',
    ]);
}

export const borrarCliente: ProcesarCliente = async (contexto, payload) => {
    const { clienteId } = payload as { clienteId: string } ?? { clienteId: contexto.cliente.id };

    return pipeCliente(contexto, [
        getContextoVacio,
        publicar('cliente_borrado', clienteId)
    ]);
}

export const darDeAltaClienteProceso: ProcesarCliente = async (contexto) => {
    await darDeAltaCliente(contexto.cliente.id);

    return pipeCliente(contexto, [
        cargarCliente(contexto.cliente.id),
        abiertoContexto,
    ]);
}

export const darDeBajaClienteProceso: ProcesarCliente = async (contexto, payload) => {
    const fechaBaja = payload as string;
    await darDeBajaCliente(contexto.cliente.id, new Date(fechaBaja));

    return pipeCliente(contexto, [
        cargarCliente(contexto.cliente.id),
        abiertoContexto,
    ]);
}

export const actualizarCuentaDomiciliada: ProcesarCliente = async (contexto, payload) => {
    const { cuenta_id, descripcion } = payload as { cuenta_id: string; descripcion: string };
    return {
        ...contexto,
        cliente: {
            ...contexto.cliente,
            cuenta_domiciliada: cuenta_id,
            descripcion_cuenta: descripcion,
        },
        clienteInicial: {
            ...contexto.clienteInicial,
            cuenta_domiciliada: cuenta_id,
            descripcion_cuenta: descripcion,
        },
    };
}

export const asignarCuentaRemesaProceso: ProcesarCliente = async (contexto, payload) => {
    const { cuenta_id, descripcion } = payload as { cuenta_id: string; descripcion: string };
    await asignarCuentaRemesa(contexto.cliente.id, cuenta_id);
    return {
        ...contexto,
        cliente: {
            ...contexto.cliente,
            cuenta_remesa: cuenta_id,
            descripcion_cuenta_remesa: descripcion,
        },
        clienteInicial: {
            ...contexto.clienteInicial,
            cuenta_remesa: cuenta_id,
            descripcion_cuenta_remesa: descripcion,
        },
    };
}

export const limpiarCuentaDomiciliada: ProcesarCliente = async (contexto) => {
    return {
        ...contexto,
        cliente: {
            ...contexto.cliente,
            cuenta_domiciliada: "",
            descripcion_cuenta: "",
        },
        clienteInicial: {
            ...contexto.clienteInicial,
            cuenta_domiciliada: "",
            descripcion_cuenta: "",
        },
    };
}


