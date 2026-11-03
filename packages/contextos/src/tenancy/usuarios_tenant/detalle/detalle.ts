import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import { UsuarioTenant } from "../diseño.js";
import { getUsuarioTenant, patchUsuarioTenant } from "../infraestructura.js";
import { ContextoDetalleUsuarioTenant, EstadoDetalleUsuarioTenant } from "./diseño.js";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleUsuarioTenant, ContextoDetalleUsuarioTenant>;

const pipeUsuario = ejecutarListaProcesos<EstadoDetalleUsuarioTenant, ContextoDetalleUsuarioTenant>;

export const metaUsuarioTenant: MetaModelo<UsuarioTenant> = {
    campos: {
        email: { requerido: true },
        nombre: { requerido: true, minimo: 2 },
        clienteId: { requerido: true },
        activo: { tipo: "checkbox" },
    },
};

export const usuarioInicial = (): UsuarioTenant => ({
    id: '',
    email: '',
    nombre: '',
    clienteId: '',
    activo: true,
});

export const contextoDetalleUsuarioTenantInicial: ContextoDetalleUsuarioTenant = {
    estado: 'INICIAL',
    usuario: usuarioInicial(),
};

export const refrescarUsuario: ProcesarDetalle = async (contexto) => {
    const usuario = await getUsuarioTenant(contexto.usuario.id);
    return [
        { ...contexto, usuario },
        [["usuario_cambiado", usuario]],
    ];
};

export const guardarUsuario = async (
    contexto: ContextoDetalleUsuarioTenant,
    usuario: UsuarioTenant
): Promise<void> => {
    if (
        usuario.email !== contexto.usuario.email ||
        usuario.nombre !== contexto.usuario.nombre ||
        usuario.clienteId !== contexto.usuario.clienteId ||
        usuario.activo !== contexto.usuario.activo
    ) {
        await patchUsuarioTenant(usuario.id, usuario);
    }
};

export const cargarUsuario: (_: string) => ProcesarDetalle =
    (idUsuario) => async (contexto) => {
        const usuario = await getUsuarioTenant(idUsuario);
        return pipeUsuario(contexto, [
            async (ctx) => ({ ...ctx, usuario }),
            'ABIERTO',
        ]);
    };

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const idUsuario = payload as string;
    if (idUsuario) {
        return cargarUsuario(idUsuario)(contexto);
    }
    return { ...contexto, estado: 'INICIAL', usuario: usuarioInicial() };
};
