import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { UsuarioTenant } from "../diseño.js";
import { getUsuarioTenant, getUsuariosTenant } from "../infraestructura.js";
import { ContextoMaestroUsuarioTenant, EstadoMaestroUsuarioTenant } from "./diseño.js";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroUsuarioTenant, ContextoMaestroUsuarioTenant>;

const conUsuarios = (fn: ProcesarListaActivaEntidades<UsuarioTenant>) =>
    (ctx: ContextoMaestroUsuarioTenant) => ({ ...ctx, usuarios: fn(ctx.usuarios) });

export const Usuarios = accionesListaActivaEntidades(conUsuarios);

export const recargarUsuarios: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getUsuariosTenant(criteria);
    return Usuarios.recargar(contexto, resultado);
};

export const ampliarUsuarios: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getUsuariosTenant(criteria);
    return Usuarios.ampliar(contexto, resultado);
};

export const incluirUsuarioCreadoPorId: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const usuario = await getUsuarioTenant(id);
    return {
        ...contexto,
        estado: "INICIAL" as EstadoMaestroUsuarioTenant,
        usuarios: {
            ...contexto.usuarios,
            lista: [usuario, ...contexto.usuarios.lista],
            total: contexto.usuarios.total + 1,
            activo: usuario.id,
        },
    };
};
