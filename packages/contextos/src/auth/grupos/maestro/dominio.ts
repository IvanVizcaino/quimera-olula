import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import {
    accionesListaActivaEntidades,
    ListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { Grupo } from "../diseño.ts";
import { getGrupos } from "../infraestructura.ts";
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

export const crearGrupo: ProcesarMaestroGrupo = async (contexto, payload) => {
    const grupo = payload as Grupo;

    return {
        ...contexto,
        grupos: {
            ...contexto.grupos,
            lista: [
                {
                    ...grupo,
                    nombre: grupo.nombre ?? (grupo as { descripcion?: string }).descripcion ?? "",
                },
                ...contexto.grupos.lista,
            ],
            total: contexto.grupos.total + 1,
        } as ListaActivaEntidades<Grupo>,
    };
};
