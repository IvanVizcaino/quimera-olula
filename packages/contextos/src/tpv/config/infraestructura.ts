import ApiUrls from "#/tpv/comun/urls.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { ConfigTpv, GetConfigTpv, TipoTarjeta } from "./diseño.ts";

type TipoTarjetaAPI = {
    id: string;
    nombre: string;
    defecto: boolean;
}

type ConfigTpvAPI = {
    cliente_id: string;
    forma_pago_efectivo_id: string;
    forma_pago_tarjeta_id: string;
    forma_pago_vale_id: string;
    serie_id: string;
    tipos_tarjeta: TipoTarjetaAPI[];
}

const baseUrl = new ApiUrls().CONFIG;

const tipoTarjetaDesdeAPI = (t: TipoTarjetaAPI): TipoTarjeta => ({
    id: t.id,
    nombre: t.nombre,
    defecto: t.defecto,
});

export const configTpvDesdeAPI = (c: ConfigTpvAPI): ConfigTpv => ({
    clienteId: c.cliente_id,
    formaPagoEfectivoId: c.forma_pago_efectivo_id,
    formaPagoTarjetaId: c.forma_pago_tarjeta_id,
    formaPagoValeId: c.forma_pago_vale_id,
    serieId: c.serie_id,
    tiposTarjeta: c.tipos_tarjeta.map(tipoTarjetaDesdeAPI),
});

export const getConfigTpv: GetConfigTpv = async () => {
    const respuesta = await RestAPI.get<{ datos: ConfigTpvAPI }>(baseUrl);
    return configTpvDesdeAPI(respuesta.datos);
};
