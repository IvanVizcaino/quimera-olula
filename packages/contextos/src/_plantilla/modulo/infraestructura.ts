import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "../comun/urls.js";
import { CambiosModulo, CampoOpcion, DeleteModulo, GetModulo, GetModulos, Modulo, NuevoModulo, PatchModulo, PostModulo } from "./diseño.js";


type OpcionApi = 'opcion_1' | 'opcion_2';

export interface ModuloApi {
    id: string;
    campo_string: string;
    campo_texto: string;
    campo_numero: number;
    campo_opcion: OpcionApi;
    campo_fecha: string;
}

export interface NuevoModuloApi {
    campo_string: string;
    campo_texto: string;
    campo_numero: number;
    campo_opcion: OpcionApi;
    campo_fecha: string;
}



type CambiosModuloApi = Partial<ModuloApi>

const baseUrl = new ApiUrls().MODULO;

const campoOpcionDesdeApi: Record<OpcionApi, CampoOpcion> = {
    opcion_1: 'opcion1',
    opcion_2: 'opcion2',
}

const campoOpcionAApi: Record<CampoOpcion, OpcionApi> = {
    opcion1: 'opcion_1',
    opcion2: 'opcion_2',
}

/**
 * Mapea respuesta de API a interfaz del dominio
 * Convierte tipos del API a tipos del dominio (ej: string a Date)
*/
export const moduloDesdeApi = (api: ModuloApi): Modulo => ({
    id: api.id,
    campoString: api.campo_string,
    campoTexto: api.campo_texto,
    campoNumero: api.campo_numero,
    campoOpcion: campoOpcionDesdeApi[api.campo_opcion],
    campoFecha: new Date(Date.parse(api.campo_fecha)),
});

/**
 * Mapea datos de creación y cambio de dominio a API
 * Convierte tipos del dominio a tipos que entiende el backend
 */
export const nuevoModuloAApi = (m: NuevoModulo): NuevoModuloApi => ({
    campo_string: m.campoString,
    campo_texto: m.campoTexto,
    campo_numero: m.campoNumero,
    campo_opcion: campoOpcionAApi[m.campoOpcion],
    campo_fecha: m.campoFecha.toISOString(),
});

const cambiosModuloAApi = (m: CambiosModulo): CambiosModuloApi => {
    const cambios: CambiosModuloApi = {}
    if (m.campoString !== undefined) cambios['campo_string'] = m.campoString;
    if (m.campoTexto !== undefined) cambios['campo_texto'] = m.campoTexto;
    if (m.campoNumero !== undefined) cambios['campo_numero'] = m.campoNumero;
    if (m.campoOpcion !== undefined) cambios['campo_opcion'] = campoOpcionAApi[m.campoOpcion];
    if (m.campoFecha !== undefined) cambios['campo_fecha'] = m.campoFecha.toISOString();
    return cambios;
};


/**
 * Obtener un módulo por ID
 */

export const getModulo: GetModulo = async (id) => {

    return await RestAPI.getItem<Modulo, ModuloApi>(
        `${baseUrl}/${id}`,
        moduloDesdeApi,
    );
}
/**
 * Obtener lista de módulos con filtros
 */
export const getModulos: GetModulos = async (criteria) => {

    return await RestAPI.getQuery<Modulo, ModuloApi>(
        baseUrl,
        criteria,
        moduloDesdeApi,
    )
};

/**
 * Crear nuevo módulo
 */
export const postModulo: PostModulo = async (nuevoModulo) => {

    const respuesta = await RestAPI.post<NuevoModuloApi>(
        baseUrl,
        nuevoModuloAApi(nuevoModulo),
        "Error al crear módulo"
    );
    return respuesta.id
}

/**
 * Actualizar módulo existente
 */
export const patchModulo: PatchModulo = async (id, cambios) => {

    await RestAPI.patch<CambiosModuloApi>(
        `${baseUrl}/${id}`,
        cambiosModuloAApi(cambios),
        "Error al actualizar módulo"
    );
};

/**
 * Eliminar módulo
 */
export const deleteModulo: DeleteModulo = async (id) => {

    await RestAPI.delete(
        `${baseUrl}/${id}`,
        "Error al eliminar módulo"
    );
};
