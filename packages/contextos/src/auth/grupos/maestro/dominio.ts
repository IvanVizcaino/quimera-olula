import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import {
    accionesListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { Grupo } from "../diseño.ts";
import { getGrupos, postGrupo } from "../infraestructura.ts";
import { ContextoMaestroGrupo, EstadoMaestroGrupo } from "./diseño.ts";

const conGrupos = (fn: ProcesarListaActivaEntidades<Grupo>) => (ctx: ContextoMaestroGrupo, payload?: unknown) => ({
    ...ctx,
    grupos: fn(ctx.grupos, payload),
});

export const Grupos = accionesListaActivaEntidades<Grupo, EstadoMaestroGrupo, ContextoMaestroGrupo>((fn) => conGrupos(fn));

type ProcesarMaestroGrupo = ProcesarContexto<EstadoMaestroGrupo, ContextoMaestroGrupo>;

export const recargarGrupos: ProcesarMaestroGrupo = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getGrupos(
        criteria?.filtro,
        criteria?.orden,
        criteria?.paginacion
    );

    return Grupos.recargar(contexto, resultado);
};

/** Da de alta el grupo en el servidor (POST /auth/grupo, que pide id y
 * descripcion) y recarga la lista con el nuevo seleccionado. Antes sólo se
 * añadía a la lista en pantalla y no se guardaba. */
export const crearGrupo: ProcesarMaestroGrupo = async (contexto, payload) => {
    const grupo = payload as Grupo;
    await postGrupo({ id: grupo.id.trim(), descripcion: grupo.nombre });
    const recargado = await recargarGrupos(contexto, contexto.grupos.criteria) as ContextoMaestroGrupo;
    return { ...recargado, grupos: { ...recargado.grupos, activo: grupo.id.trim() } };
};
