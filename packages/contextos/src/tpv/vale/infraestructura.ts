import { RestAPI } from "@olula/lib/api/rest_api.js";
import ApiUrls from "../comun/urls.ts";
import { GetValeTpv, GetValesEmitidos, ValeEmitido, ValeTpv } from "./diseño.ts";

const baseUrl = new ApiUrls().VALE;

type ValeTpvAPI = ValeTpv;

interface ValeEmitidoAPI {
    id: string;
    venta_id: string;
    fecha: string;
    hora: string;
    cliente_id: string | null;
    nombre_cliente: string | null;
    punto_venta_id: string | null;
    punto_venta: string | null;
    saldo_inicial: number;
    saldo_consumido: number;
    saldo_pendiente: number;
    anulado: boolean;
}

export const valeDesdeAPI = (p: ValeTpvAPI): ValeTpv => p;

const valeEmitidoDesdeAPI = (api: ValeEmitidoAPI): ValeEmitido => ({
    id: api.id,
    ventaId: api.venta_id,
    fecha: api.fecha,
    hora: api.hora,
    clienteId: api.cliente_id,
    nombreCliente: api.nombre_cliente,
    puntoVentaId: api.punto_venta_id,
    puntoVenta: api.punto_venta,
    saldoInicial: api.saldo_inicial,
    saldoConsumido: api.saldo_consumido,
    saldoPendiente: api.saldo_pendiente,
    anulado: api.anulado,
});

export const getVale: GetValeTpv = async (id) => {
    return RestAPI.get<{ datos: ValeTpv }>(`${baseUrl}/${id}`).then((respuesta) =>
        valeDesdeAPI(respuesta.datos)
    );
};

/** GET /tpv/vale/emitidos — lista de vales emitidos (requiere plugin `vales_tpv`). */
export const getValesEmitidos: GetValesEmitidos = async (criteria) =>
    RestAPI.getQuery<ValeEmitido, ValeEmitidoAPI>(
        `${baseUrl}/emitidos`,
        criteria,
        valeEmitidoDesdeAPI,
    );

/** POST /tpv/vale/<id>/anular — anula un vale con saldo (requiere plugin `vales_tpv`). */
export const anularVale = async (
    valeId: string,
    ventaId: string,
    puntoVentaId: string,
): Promise<void> => {
    await RestAPI.post(
        `${baseUrl}/${valeId}/anular`,
        { venta_id: ventaId, punto_venta_id: puntoVentaId },
        "Error al anular el vale",
    );
};