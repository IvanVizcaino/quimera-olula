import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "#/contabilidad/comun/urls.ts";
import { CambiosSecuencia, SecuenciaContabilidad, SecuenciaSerie } from "./diseño.ts";

const urls = new ApiUrls();

const urlSecuencias = (ejercicioId: string, serieId: string) =>
    `${urls.EJERCICIO_ALTA}/${encodeURIComponent(ejercicioId)}/serie/${encodeURIComponent(serieId)}/secuencia`;

interface SecuenciaSerieApi {
    id: number | null;
    nombre: string;
    descripcion: string | null;
    valor: number | null;
    valorout: number | null;
    valorini: number | null;
}

export const secuenciaSerieDesdeApi = (api: SecuenciaSerieApi): SecuenciaSerie => ({
    id: api.nombre,
    idsec: api.id,
    nombre: api.nombre,
    descripcion: api.descripcion ?? "",
    valor: api.valor,
    valorout: api.valorout,
    valorini: api.valorini,
});

export const getSecuenciasSerie = async (ejercicioId: string, serieId: string): Promise<SecuenciaSerie[]> => {
    const respuesta = await RestAPI.get<{ datos: SecuenciaSerieApi[] }>(urlSecuencias(ejercicioId, serieId));
    return respuesta.datos.map(secuenciaSerieDesdeApi);
};

export const patchSecuenciaSerie = async (
    ejercicioId: string, serieId: string, nombre: string, cambios: CambiosSecuencia,
): Promise<void> => {
    await RestAPI.patch(
        `${urlSecuencias(ejercicioId, serieId)}/${encodeURIComponent(nombre)}`,
        cambios,
        "Error al guardar la secuencia",
    );
};

interface SecuenciaContabilidadApi {
    id: number;
    nombre: string;
    descripcion: string | null;
    valor: number | null;
    valorout: number | null;
}

export const secuenciaContabilidadDesdeApi = (api: SecuenciaContabilidadApi): SecuenciaContabilidad => ({
    id: String(api.id),
    nombre: api.nombre,
    descripcion: api.descripcion ?? "",
    valor: api.valor,
    valorout: api.valorout,
});

export const getSecuenciasContabilidad = async (ejercicioId: string): Promise<SecuenciaContabilidad[]> => {
    const respuesta = await RestAPI.get<{ datos: SecuenciaContabilidadApi[] }>(
        `${urls.EJERCICIO}/${encodeURIComponent(ejercicioId)}/secuencia`,
    );
    return respuesta.datos.map(secuenciaContabilidadDesdeApi);
};
