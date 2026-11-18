import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import {
    ColumnaResultado,
    FichaInforme,
    FilaResultado,
    ModoInforme,
    PestañaInforme,
    ResultadoInforme,
} from "./diseño.ts";
import { fichaAApi, fichaDesdeApi } from "./dominio.ts";

export interface ResultadoInformeApi {
    modo: ModoInforme;
    titulo: string;
    columnas: ColumnaResultado[];
    columnas_lineas: ColumnaResultado[];
    filas: FilaResultado[];
    total_documentos: number;
}

export const resultadoDesdeApi = (
    api: ResultadoInformeApi
): ResultadoInforme => ({
    modo: api.modo,
    titulo: api.titulo,
    columnas: api.columnas,
    columnasLineas: api.columnas_lineas ?? [],
    filas: api.filas.map((fila) => ({ ...fila, lineas: fila.lineas ?? [] })),
    totalDocumentos: api.total_documentos,
});

export const getFichasInforme = async (
    pestaña: PestañaInforme,
    criteria: Criteria
) =>
    RestAPI.getQuery<FichaInforme, Record<string, unknown>>(
        pestaña.url,
        criteria,
        fichaDesdeApi(pestaña)
    );

export const getFichaInforme = async (
    pestaña: PestañaInforme,
    id: string
): Promise<FichaInforme> =>
    RestAPI.getItem<FichaInforme, Record<string, unknown>>(
        `${pestaña.url}/${id}`,
        fichaDesdeApi(pestaña)
    );

export const postFichaInforme = async (
    pestaña: PestañaInforme,
    ficha: FichaInforme
): Promise<string> => {
    const respuesta = await RestAPI.post(
        pestaña.url,
        fichaAApi(pestaña, ficha),
        "Error al crear el informe"
    );
    return String(respuesta.id);
};

export const patchFichaInforme = async (
    pestaña: PestañaInforme,
    id: string,
    cambios: Record<string, unknown>
): Promise<void> => {
    await RestAPI.patch(
        `${pestaña.url}/${id}`,
        cambios,
        "Error al guardar el informe"
    );
};

export const deleteFichaInforme = async (
    pestaña: PestañaInforme,
    id: string
): Promise<void> => {
    await RestAPI.delete(`${pestaña.url}/${id}`, "Error al borrar el informe");
};

export const getResultadoInforme = async (
    pestaña: PestañaInforme,
    id: string,
    modo: ModoInforme
): Promise<ResultadoInforme> =>
    RestAPI.getItem<ResultadoInforme, ResultadoInformeApi>(
        `${pestaña.url}/${id}/resultado?modo=${modo}`,
        resultadoDesdeApi,
        "Error al calcular el informe"
    );

export const getReportInforme = async (
    pestaña: PestañaInforme,
    id: string,
    modo: ModoInforme
): Promise<Blob> =>
    RestAPI.blob(
        `${pestaña.url}/${id}/report?modo=${modo}`,
        "Error al descargar el PDF del informe"
    );
