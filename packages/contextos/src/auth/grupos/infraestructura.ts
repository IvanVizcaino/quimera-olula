import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import { Grupo, Permiso, Regla } from "./diseño.ts";

const baseUrl = `/auth`;

// export const getGrupos = async (): RespuestaLista<Grupo> => {
//     return { datos: grupos, total: 1 };
// };

export const getGrupo = async (id: string): Promise<Grupo> =>
    await RestAPI.get<{ datos: Grupo }>(`${baseUrl}/grupo/${id}`).then((respuesta) => respuesta.datos);


export const getGrupos = async (
    filtro?: Filtro,
    orden?: Orden,
    paginacion?: Paginacion
): RespuestaLista<Grupo> => {
    const q = criteriaQuery(filtro, orden, paginacion);

    return await RestAPI.get<{ datos: Grupo[]; total: number }>(baseUrl + '/grupo' + q);
};

export const postGrupo = async (accion: Partial<Grupo>): Promise<string> => {
    return await RestAPI.post(baseUrl + '/grupo', accion, "Error al guardar grupo").then((respuesta) => respuesta.id);
};

export const patchGrupo = async (id: string, datos: Partial<Grupo>): Promise<void> => {
    await RestAPI.patch(`${baseUrl}/grupo/${id}`, datos, "Error al guardar grupo");
};

// export const getReglas = async (): RespuestaLista<Regla> => {
//     return { datos: rules, total: rules.length };
// };

export const getReglas = async (
    filtro?: Filtro,
    orden?: Orden,
    paginacion?: Paginacion
): RespuestaLista<Regla> => {
    const q = criteriaQuery(filtro, orden, paginacion);

    return await RestAPI.get<{ datos: Regla[]; total: number }>(baseUrl + '/regla' + q);
};

// export const getPermisos = async () => {
//     return permisos;
// };

export const getPermisos = async (
    filtro?: Filtro,
    orden?: Orden,
    paginacion?: Paginacion
): RespuestaLista<Permiso> => {
    const q = criteriaQuery(filtro, orden, paginacion);

    return await RestAPI.get<RespuestaLista<Permiso>>(baseUrl + '/permiso' + q);
};

export const putPermiso = async (grupo: string, regla: string, valor: boolean | null): Promise<void> => {
    await RestAPI.put(baseUrl + '/permiso', { grupo, regla, valor }, "Error al guardar persmiso");
};

export const getPermisosGrupo = async (
    grupoId?: string,
): RespuestaLista<Permiso> => {

    return await RestAPI.get<{ datos: Permiso[]; total: number }>(baseUrl + '/permiso/por_grupo/' + grupoId);
};

