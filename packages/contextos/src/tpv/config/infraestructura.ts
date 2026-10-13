import ApiUrls from "#/tpv/comun/urls.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { ConfigTpv, GetConfigTpv, TipoTarjeta } from "./diseño.ts";
import { completarOpcionesTpv } from "./dominio.ts";

type TipoTarjetaAPI = {
    id: string;
    nombre: string;
    defecto: boolean;
}

export type OpcionesTpvAPI = {
    botones_ocultos?: string[];
    ticket_regalo?: string;
    devolucion_imprimir?: string;
    emitir_vale_reimprime_tique?: boolean;
    emitir_vale_avanza_siempre?: boolean;
    imprimir_tique_al_cobrar?: boolean;
    abrir_cajon_al_cobrar?: boolean;
    pasar_siguiente_venta_auto?: boolean;
    confirmar_siguiente_venta?: boolean;
}

type ConfigTpvAPI = {
    cliente_id: string;
    forma_pago_efectivo_id: string;
    forma_pago_tarjeta_id: string;
    forma_pago_vale_id: string;
    serie_id: string;
    tipos_tarjeta: TipoTarjetaAPI[];
    opciones?: OpcionesTpvAPI;
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
    opciones: completarOpcionesTpv(c.opciones),
});

export const getConfigTpv: GetConfigTpv = async () => {
    const respuesta = await RestAPI.get<{ datos: ConfigTpvAPI }>(baseUrl);
    return configTpvDesdeAPI(respuesta.datos);
};
