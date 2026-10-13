import ApiUrls from "#/almacen/comun/urls.ts";
import { RestAPI } from "@olula/lib/api/rest_api.js";
import { PostBorrarMovimientoLoteCompra, PostCrearMovimientoLoteCompra } from "./diseño.ts";

const baseUrl = new ApiUrls().ALBARAN_COMPRA;

export const postCrearMovimientoLoteCompra: PostCrearMovimientoLoteCompra = async (
    documentoId,
    lineaId,
    payload
) => {
    await RestAPI.patch(
        `${baseUrl}/${documentoId}/linea/${lineaId}/crear_movimiento_lote`,
        payload,
        "Error al crear movimiento de lote"
    );
};

export const postBorrarMovimientoLoteCompra: PostBorrarMovimientoLoteCompra = async (
    documentoId,
    lineaId,
    payload
) => {
    await RestAPI.patch(
        `${baseUrl}/${documentoId}/linea/${lineaId}/borrar_movimiento_lote`,
        payload,
        "Error al borrar movimiento de lote"
    );
};
