import ApiUrls from "#/contabilidad/comun/urls.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    CambiosPatrimonioNeto,
    DeletePatrimonioNeto,
    EstadoPatrimonioNeto,
    FormatoHoja,
    GetDatosPatrimonioNeto,
    GetHojaPatrimonioNeto,
    GetListaPatrimonioNeto,
    GetPatrimonioNeto,
    GetReportPatrimonioNeto,
    NuevoPatrimonioNeto,
    PatchPatrimonioNeto,
    PatrimonioNeto,
    PostPatrimonioNeto,
} from "./diseño.ts";

const urls = new ApiUrls();
const baseUrl = urls.PATRIMONIO_NETO;

export interface PatrimonioNetoApi {
    id: number;
    descripcion: string;
    ejercicio_id: string;
    ejercicio_anterior_id: string | null;
    ejercicio_anterior_anterior_id: string | null;
}

export const patrimonioNetoDesdeApi = (
    api: PatrimonioNetoApi
): PatrimonioNeto => ({
    id: String(api.id),
    descripcion: api.descripcion,
    ejercicioId: api.ejercicio_id,
    ejercicioAnteriorId: api.ejercicio_anterior_id ?? "",
    ejercicioAnteriorAnteriorId: api.ejercicio_anterior_anterior_id ?? "",
});

export interface EstadoPatrimonioNetoApi {
    ejercicio_id: string;
    ejercicio_anterior_id: string | null;
    anyo: string;
    anyo_anterior: string;
    titulo: string;
    columnas: { clave: string; descripcion: string }[];
    filas: {
        clave: string;
        descripcion: string;
        nivel: number;
        importes: number[];
    }[];
}

export const estadoDesdeApi = (
    api: EstadoPatrimonioNetoApi
): EstadoPatrimonioNeto => ({
    ejercicioId: api.ejercicio_id,
    ejercicioAnteriorId: api.ejercicio_anterior_id ?? "",
    anyo: api.anyo,
    anyoAnterior: api.anyo_anterior,
    titulo: api.titulo,
    columnas: api.columnas.map((c) => ({ ...c })),
    filas: api.filas.map((f) => ({ ...f, importes: [...f.importes] })),
});

const ejercicioAApi = (valor: string): string | null => valor.trim() || null;

export const nuevoPatrimonioNetoAApi = (nuevo: NuevoPatrimonioNeto) => ({
    descripcion: nuevo.descripcion,
    ejercicio_id: nuevo.ejercicioId,
    ejercicio_anterior_id: ejercicioAApi(nuevo.ejercicioAnteriorId),
    ejercicio_anterior_anterior_id: ejercicioAApi(
        nuevo.ejercicioAnteriorAnteriorId
    ),
});

export const cambiosPatrimonioNetoAApi = (cambios: CambiosPatrimonioNeto) => {
    const api: Record<string, unknown> = {};
    if (cambios.descripcion !== undefined) api.descripcion = cambios.descripcion;
    if (cambios.ejercicioId !== undefined) api.ejercicio_id = cambios.ejercicioId;
    if (cambios.ejercicioAnteriorId !== undefined)
        api.ejercicio_anterior_id = ejercicioAApi(cambios.ejercicioAnteriorId);
    if (cambios.ejercicioAnteriorAnteriorId !== undefined)
        api.ejercicio_anterior_anterior_id = ejercicioAApi(
            cambios.ejercicioAnteriorAnteriorId
        );
    return api;
};

export const getListaPatrimonioNeto: GetListaPatrimonioNeto = async (criteria) =>
    RestAPI.getQuery<PatrimonioNeto, PatrimonioNetoApi>(
        baseUrl,
        criteria,
        patrimonioNetoDesdeApi
    );

export const getPatrimonioNeto: GetPatrimonioNeto = async (id) =>
    RestAPI.getItem<PatrimonioNeto, PatrimonioNetoApi>(
        `${baseUrl}/${id}`,
        patrimonioNetoDesdeApi
    );

export const getDatosPatrimonioNeto: GetDatosPatrimonioNeto = async (id) =>
    RestAPI.getItem<EstadoPatrimonioNeto, EstadoPatrimonioNetoApi>(
        urls.PATRIMONIO_NETO_DATOS(id),
        estadoDesdeApi,
        "Error al calcular el estado de cambios en el patrimonio neto"
    );

export const postPatrimonioNeto: PostPatrimonioNeto = async (nuevo) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        nuevoPatrimonioNetoAApi(nuevo),
        "Error al crear el informe de patrimonio neto"
    );
    return String(respuesta.id);
};

export const patchPatrimonioNeto: PatchPatrimonioNeto = async (id, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${id}`,
        cambiosPatrimonioNetoAApi(cambios),
        "Error al guardar el informe de patrimonio neto"
    );
};

export const deletePatrimonioNeto: DeletePatrimonioNeto = async (id) => {
    await RestAPI.delete(
        `${baseUrl}/${id}`,
        "Error al borrar el informe de patrimonio neto"
    );
};

export const getReportPatrimonioNeto: GetReportPatrimonioNeto = async (id) =>
    RestAPI.blob(
        urls.PATRIMONIO_NETO_REPORT(id),
        "Error al descargar el PDF del patrimonio neto"
    );

export const getHojaPatrimonioNeto: GetHojaPatrimonioNeto = async (
    id,
    formato: FormatoHoja
) =>
    RestAPI.blob(
        urls.PATRIMONIO_NETO_HOJA(id, formato),
        "Error al descargar la hoja del patrimonio neto"
    );
