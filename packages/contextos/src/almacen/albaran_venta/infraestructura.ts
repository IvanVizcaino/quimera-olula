import ApiUrls from "#/almacen/comun/urls.ts";
import { RestAPI } from "@olula/lib/api/rest_api.js";
import { GetLoteSugerido, PostBorrarMovimientoLote, PostCrearMovimientoLote } from "./diseño.ts";

const baseUrl = new ApiUrls().ALBARAN_VENTA;
const loteUrl = `/almacen/lote`;

export const postCrearMovimientoLote: PostCrearMovimientoLote = async (albaranId, lineaId, payload) => {
    await RestAPI.patch(
        `${baseUrl}/${albaranId}/linea/${lineaId}/crear_movimiento_lote`,
        payload,
        "Error al crear movimiento de lote"
    );
};

export const postBorrarMovimientoLote: PostBorrarMovimientoLote = async (albaranId, lineaId, payload) => {
    await RestAPI.patch(
        `${baseUrl}/${albaranId}/linea/${lineaId}/borrar_movimiento_lote`,
        payload,
        "Error al borrar movimiento de lote"
    );
};

/** CC-04: GET /almacen/lote/sugerido?referencia=<ref>
 *  → { codlote: string | null }  (sin wrapper "datos"). */
export const getLoteSugerido: GetLoteSugerido = async (referencia) => {
    const respuesta = await RestAPI.get<{ codlote: string | null }>(
        `${loteUrl}/sugerido?referencia=${encodeURIComponent(referencia)}`
    );
    return respuesta.codlote;
};
