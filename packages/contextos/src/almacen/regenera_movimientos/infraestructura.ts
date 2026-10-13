import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    PeticionRegenerarMovimientos,
    PostRegenerarMovimientos,
    ResumenRegeneracion,
} from "./diseño.ts";

const URL_REGENERA = "/almacen/regenera_movimientos";

interface ResumenRegeneracionApi {
    articulos: number;
    lineas: number;
    stocks_revisados: number;
    por_documento: Record<string, number>;
}

const resumenDesdeApi = (api: ResumenRegeneracionApi): ResumenRegeneracion => ({
    articulos: api.articulos,
    lineas: api.lineas,
    stocksRevisados: api.stocks_revisados,
    porDocumento: api.por_documento ?? {},
});

const peticionAApi = (p: PeticionRegenerarMovimientos): Record<string, unknown> => ({
    almacen_id: p.almacenId,
    ...(p.articulos ? { articulos: p.articulos } : {}),
    ...(p.familiaId ? { familia_id: p.familiaId } : {}),
});

export const postRegenerarMovimientos: PostRegenerarMovimientos = async (peticion) => {
    // `RestAPI.query` hace POST y devuelve el cuerpo; el backend responde `{datos}` o el resumen plano.
    const respuesta = await RestAPI.query<Record<string, unknown>, ResumenRegeneracionApi | { datos: ResumenRegeneracionApi }>(
        URL_REGENERA,
        peticionAApi(peticion),
        "Error al regenerar los movimientos de stock",
    );
    const api = "datos" in respuesta ? respuesta.datos : respuesta;
    return resumenDesdeApi(api);
};

export const peticionAApiParaTest = peticionAApi;
export const resumenDesdeApiParaTest = resumenDesdeApi;
