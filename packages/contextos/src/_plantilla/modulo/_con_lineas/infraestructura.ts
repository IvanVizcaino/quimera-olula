import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "../../comun/urls.js";
import { NuevoModulo } from "../diseño.js";
import { ModuloApi, moduloDesdeApi, nuevoModuloAApi, NuevoModuloApi } from "../infraestructura.js";
import {
    CambiosLineaModulo,
    CambiosModLin,
    DeleteLineaModulo,
    DeleteModLin,
    GetModLin,
    GetModLins,
    ItemModLin,
    LineaModulo,
    ModLin,
    NuevaLineaModulo,
    PatchLineaModulo,
    PatchModLin,
    PostLineaModulo,
    PostModLin,
} from "./diseño.js";


interface ModLinApi extends ModuloApi {
    lineas: LineaModuloApi[];
}


type CambiosModLinApi = Partial<ModLinApi>;

interface LineaModuloApi {
    id: string;
    campo_string: string;
}

interface NuevaLineaModuloApi {
    campo_string: string;
}

type CambiosLineaModuloApi = Partial<LineaModuloApi>;

/**
 * Tipo API para el listado ligero (sin líneas embebidas).
 * Adaptar campos a lo que devuelva tu endpoint GET /modulos.
 */
interface ItemModLinApi {
    id: string;
    campo_string: string;
}

const baseUrl = new ApiUrls().MODULO;

/**
 * Mapea respuesta de API a interfaz del dominio
 * Convierte tipos del API a tipos del dominio (ej: string a Date)
 */
export const modLinDesdeApi = (api: ModLinApi): ModLin => ({
    ...moduloDesdeApi(api),
    lineas: api.lineas.map(lineaModuloDesdeApi),
});

const lineaModuloDesdeApi = (api: LineaModuloApi): LineaModulo => ({
    id: api.id,
    campoString: api.campo_string,
});

const itemModLinDesdeApi = (api: ItemModLinApi): ItemModLin => ({
    id: api.id,
    campoString: api.campo_string,
});

/**
 * Mapea datos de creación y cambio de dominio a API
 * Convierte tipos del dominio a tipos que entiende el backend
 */
const nuevoModLinAApi = (m: NuevoModulo): NuevoModuloApi => nuevoModuloAApi(m);

const cambiosModLinAApi = (m: CambiosModLin): CambiosModLinApi => {
    const cambios: CambiosModLinApi = {};
    if (m.campoString !== undefined) cambios.campo_string = m.campoString
    return cambios;
};

const nuevaLineaModuloAApi = (l: NuevaLineaModulo): NuevaLineaModuloApi => ({
    campo_string: l.campoString,
});

const cambiosLineaModuloAApi = (l: CambiosLineaModulo): CambiosLineaModuloApi => {
    const cambios: CambiosLineaModuloApi = {};
    if (l.campoString !== undefined) cambios.campo_string = l.campoString
    return cambios;
};


/**
 * Obtener un módulo por ID
 */
export const getModLin: GetModLin = async (id) => {
    return await RestAPI.getItem<ModLin, ModLinApi>(
        `${baseUrl}/${id}`,
        modLinDesdeApi,
        "Error al obtener módulo",
    );
};

/**
 * Obtener lista de módulos con filtros
 */
export const getModLins: GetModLins = async (criteria) => {
    return await RestAPI.getQuery<ItemModLin, ItemModLinApi>(
        baseUrl,
        criteria,
        itemModLinDesdeApi,
        "Error al obtener módulos",
    );
};

/**
 * Crear nuevo módulo
 */
export const postModLin: PostModLin = async (nuevoModLin) => {
    const respuesta = await RestAPI.post<NuevoModuloApi>(
        baseUrl,
        nuevoModLinAApi(nuevoModLin),
        "Error al crear módulo"
    );
    return respuesta.id;
};

/**
 * Crear nueva línea en un módulo
 */
export const postLineaModulo: PostLineaModulo = async (id, nuevaLinea) => {
    const respuesta = await RestAPI.post<NuevaLineaModuloApi>(
        `${baseUrl}/${id}/lineas`,
        nuevaLineaModuloAApi(nuevaLinea),
        "Error al crear línea"
    );
    return respuesta.id;
};

/**
 * Actualizar módulo existente
 */
export const patchModLin: PatchModLin = async (id, cambios) => {
    await RestAPI.patch<CambiosModLinApi>(
        `${baseUrl}/${id}`,
        cambiosModLinAApi(cambios),
        "Error al actualizar módulo"
    );
};

/**
 * Actualizar línea existente
 */
export const patchLineaModulo: PatchLineaModulo = async (id, lineaId, cambios) => {
    await RestAPI.patch<CambiosLineaModuloApi>(
        `${baseUrl}/${id}/lineas/${lineaId}`,
        cambiosLineaModuloAApi(cambios),
        "Error al actualizar línea"
    );
};

/**
 * Eliminar módulo
 */
export const deleteModLin: DeleteModLin = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, "Error al eliminar módulo");
};

/**
 * Eliminar línea de un módulo
 */
export const deleteLineaModulo: DeleteLineaModulo = async (id, lineaId) => {
    await RestAPI.delete(`${baseUrl}/${id}/lineas/${lineaId}`, "Error al eliminar línea");
};
