import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import { ClienteTenant } from "../diseño.js";
import { getClienteTenant, patchClienteTenant } from "../infraestructura.js";
import { ContextoDetalleClienteTenant, EstadoDetalleClienteTenant } from "./diseño.js";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleClienteTenant, ContextoDetalleClienteTenant>;

const pipeCliente = ejecutarListaProcesos<EstadoDetalleClienteTenant, ContextoDetalleClienteTenant>;

export const metaClienteTenant: MetaModelo<ClienteTenant> = {
    campos: {
        nombre: { requerido: true, minimo: 2 },
        activo: { tipo: "checkbox" },
        // cadenaConexionCifrada no se edita en el detalle (solo lectura)
    },
};

export const clienteInicial = (): ClienteTenant => ({
    id: '',
    nombre: '',
    cadenaConexionCifrada: '',
    activo: true,
});

export const contextoDetalleClienteTenantInicial: ContextoDetalleClienteTenant = {
    estado: 'INICIAL',
    cliente: clienteInicial(),
};

export const refrescarCliente: ProcesarDetalle = async (contexto) => {
    const cliente = await getClienteTenant(contexto.cliente.id);
    return [
        { ...contexto, cliente },
        [["cliente_cambiado", cliente]],
    ];
};

export const guardarCliente = async (
    contexto: ContextoDetalleClienteTenant,
    cliente: ClienteTenant
): Promise<void> => {
    if (
        cliente.nombre !== contexto.cliente.nombre ||
        cliente.activo !== contexto.cliente.activo
    ) {
        await patchClienteTenant(cliente.id, { nombre: cliente.nombre, activo: cliente.activo });
    }
};

export const cargarCliente: (_: string) => ProcesarDetalle =
    (idCliente) => async (contexto) => {
        const cliente = await getClienteTenant(idCliente);
        return pipeCliente(contexto, [
            async (ctx) => ({ ...ctx, cliente }),
            'ABIERTO',
        ]);
    };

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const idCliente = payload as string;
    if (idCliente) {
        return cargarCliente(idCliente)(contexto);
    }
    return { ...contexto, estado: 'INICIAL', cliente: clienteInicial() };
};
