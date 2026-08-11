import { Criteria, ProcesarContexto } from "@olula/lib/diseño.js";
import { accionesListaEntidades, ProcesarListaEntidades } from "@olula/lib/ListaEntidades.js";
import { Usuario } from "../diseño.ts";
import { getUsuarios } from "../infraestructura.ts";
import { ContextoMaestroUsuario, EstadoMaestroUsuario } from "./diseño.ts";

type ProcesarMaestroUsuario = ProcesarContexto<EstadoMaestroUsuario, ContextoMaestroUsuario>;

const conUsuarios = (fn: ProcesarListaEntidades<Usuario>) => (ctx: ContextoMaestroUsuario) => ({ ...ctx, usuarios: fn(ctx.usuarios) });

export const Usuarios = accionesListaEntidades(conUsuarios);

export const cargarUsuarios: ProcesarMaestroUsuario = async (contexto) => {
    const respuesta = await getUsuarios([], ["id", "DESC"], { pagina: 1, limite: 10 });

    return {
        ...contexto,
        usuarios: {
            lista: respuesta.datos,
            total: respuesta.total,
            activo: null,
        },
        estado: "LISTO",
    };
};

export const recargarUsuarios: ProcesarMaestroUsuario = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getUsuarios(criteria.filtro, criteria.orden, criteria.paginacion);
    const usuariosCargados = resultado.datos;
    const { pagina = 1, limite = usuariosCargados.length } = criteria.paginacion ?? {};
    const totalMinimoPaginaActual = ((pagina - 1) * limite) + usuariosCargados.length;
    const total = resultado.total >= totalMinimoPaginaActual
        ? resultado.total
        : Math.max(contexto.usuarios.total, totalMinimoPaginaActual);

    const usuarioActivo = contexto.usuarios.activo
        ? usuariosCargados.find(u => u.id === contexto.usuarios.activo?.id) ?? null
        : null;

    return {
        ...contexto,
        usuarios: {
            lista: usuariosCargados,
            total,
            activo: usuarioActivo,
        },
        estado: "LISTO",
    };
};

export const cambiarUsuarioSeleccionado: ProcesarMaestroUsuario = async (contexto, payload) => {
    const usuario = payload as Usuario;
    return Usuarios.activar(contexto, usuario);
};

export const usuarioCreado: ProcesarMaestroUsuario = async (contexto, payload) => {
    const usuario = payload as Usuario;
    return Usuarios.incluir(contexto, usuario);
};

export const usuarioCambiado: ProcesarMaestroUsuario = async (contexto, payload) => {
    const usuario = payload as Usuario;
    return Usuarios.cambiar(contexto, usuario);
};

export const usuarioBorrado: ProcesarMaestroUsuario = async (contexto) => {
    const { usuarios } = contexto;
    if (!usuarios.activo) return contexto;

    return Usuarios.quitar(contexto, usuarios.activo.id);
};

export const cancelarSeleccion: ProcesarMaestroUsuario = async (contexto) => {
    return Usuarios.desactivar(contexto);
};
