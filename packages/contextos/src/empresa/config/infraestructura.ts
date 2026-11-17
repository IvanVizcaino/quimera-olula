import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "../comun/urls.ts";
import { ConfigEmpresa, GetConfigEmpresa, PatchConfigEmpresa } from "./diseño.ts";
import { configEmpresaPorDefecto } from "./dominio.ts";

export interface ConfigEmpresaApi {
    grupo_iva_negocio_id: string;
}

const baseUrl = new ApiUrls().CONFIG;

export const configEmpresaDesdeApi = (api: ConfigEmpresaApi): ConfigEmpresa => ({
    grupoIvaNegocioId: api.grupo_iva_negocio_id ?? "",
});

export const configEmpresaAApi = (config: ConfigEmpresa): ConfigEmpresaApi => ({
    grupo_iva_negocio_id: config.grupoIvaNegocioId,
});

/** Sin fila en `facturac_general` (404) la instalación aún no se ha configurado. */
export const getConfigEmpresa: GetConfigEmpresa = async () => {
    try {
        const respuesta = await RestAPI.get<{ datos: ConfigEmpresaApi }>(baseUrl);
        return configEmpresaDesdeApi(respuesta.datos);
    } catch (error) {
        if ((error as { estado?: number }).estado === 404) return configEmpresaPorDefecto;
        throw error;
    }
};

export const patchConfigEmpresa: PatchConfigEmpresa = async (config) => {
    await RestAPI.patch(
        baseUrl, { cambios: configEmpresaAApi(config) }, "Error al guardar la configuración de empresa");
};
