import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { ConfigProduccion, GetConfigProduccion, PatchConfigProduccion } from "./diseño.ts";

const baseUrl = `/produccion/config`;

export interface ConfigProduccionApi {
    pedido_completo: boolean;
    usar_tramos: boolean;
    control_tiempo: boolean;
    mostrar_formulario: boolean;
}

export const configProduccionDesdeApi = (api: ConfigProduccionApi): ConfigProduccion => ({
    pedidoCompleto: !!api.pedido_completo,
    usarTramos: !!api.usar_tramos,
    controlTiempo: !!api.control_tiempo,
    mostrarFormulario: !!api.mostrar_formulario,
});

export const configProduccionAApi = (c: ConfigProduccion): ConfigProduccionApi => ({
    pedido_completo: c.pedidoCompleto,
    usar_tramos: c.usarTramos,
    control_tiempo: c.controlTiempo,
    mostrar_formulario: c.mostrarFormulario,
});

/** Sin filas el servidor devuelve todo a falso (no hay 404). */
export const getConfigProduccion: GetConfigProduccion = async () => {
    const respuesta = await RestAPI.get<{ datos: ConfigProduccionApi }>(baseUrl, "Error al leer la configuración de producción");
    return configProduccionDesdeApi(respuesta.datos);
};

export const patchConfigProduccion: PatchConfigProduccion = async (config) => {
    await RestAPI.patch(baseUrl, configProduccionAApi(config), "Error al guardar la configuración de producción");
};
