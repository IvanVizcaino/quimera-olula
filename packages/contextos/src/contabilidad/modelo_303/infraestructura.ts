import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "#/contabilidad/comun/urls.ts";
import {
    DiffModelo303,
    GetExportAeatModelo303,
    GetGeneracionModelo303,
    GetModelo303,
    GetModelos303,
    ItemModelo303,
    Modelo303Cabecera,
    PatchGenerarModelo303,
    ResultadoGeneracionModelo303,
    TotalesModelo303,
} from "./diseño.ts";

const urls = new ApiUrls();

interface DiffModelo303Api {
    clave: string;
    almacenado: number;
    calculado: number;
    delta: number;
}

interface TotalesModelo303Api {
    cuotadevtotal: number;
    cuotadedtotal: number;
    cuotadif: number;
    resliquid: number;
    cuotaresultado: number;
}

interface ItemModelo303Api {
    id: number;
    codejercicio: string;
    tipo_periodo: string | null;
    trimestre: string | null;
    mes: string | null;
    fecha_inicio: string;
    fecha_fin: string;
    totales: TotalesModelo303Api;
}

interface Modelo303CabeceraApi extends ItemModelo303Api {
    complementaria: boolean;
    sinactividad: boolean;
}

interface ResultadoGeneracionModelo303Api {
    modelo_id: number;
    codejercicio: string;
    fecha_inicio: string;
    fecha_fin: string;
    calculado: Record<string, number>;
    diffs: DiffModelo303Api[];
    coincide: boolean;
}

const totalesModelo303DesdeApi = (api: TotalesModelo303Api): TotalesModelo303 => ({
    cuotadevtotal: api.cuotadevtotal,
    cuotadedtotal: api.cuotadedtotal,
    cuotadif: api.cuotadif,
    resliquid: api.resliquid,
    cuotaresultado: api.cuotaresultado,
});

export const itemModelo303DesdeApi = (api: ItemModelo303Api): ItemModelo303 => ({
    id: String(api.id),
    modeloId: api.id,
    codejercicio: api.codejercicio,
    tipoPeriodo: api.tipo_periodo,
    trimestre: api.trimestre,
    mes: api.mes,
    fechaInicio: api.fecha_inicio,
    fechaFin: api.fecha_fin,
    totales: totalesModelo303DesdeApi(api.totales),
    resliquid: api.totales.resliquid,
    cuotaresultado: api.totales.cuotaresultado,
});

export const modelo303CabeceraDesdeApi = (api: Modelo303CabeceraApi): Modelo303Cabecera => ({
    ...itemModelo303DesdeApi(api),
    complementaria: api.complementaria,
    sinactividad: api.sinactividad,
});

export const diffModelo303DesdeApi = (api: DiffModelo303Api): DiffModelo303 => ({
    id: api.clave,
    clave: api.clave,
    almacenado: api.almacenado,
    calculado: api.calculado,
    delta: api.delta,
});

export const resultadoGeneracionModelo303DesdeApi = (
    api: ResultadoGeneracionModelo303Api
): ResultadoGeneracionModelo303 => ({
    modeloId: api.modelo_id,
    codejercicio: api.codejercicio,
    fechaInicio: api.fecha_inicio,
    fechaFin: api.fecha_fin,
    calculado: api.calculado,
    diffs: api.diffs.map(diffModelo303DesdeApi),
    coincide: api.coincide,
});

export const getModelos303: GetModelos303 = async (criteria) =>
    RestAPI.getQuery<ItemModelo303, ItemModelo303Api>(
        urls.MODELO_303,
        criteria,
        itemModelo303DesdeApi,
        "Error al listar modelos 303"
    );

export const getModelo303: GetModelo303 = async (modeloId) =>
    RestAPI.getItem<Modelo303Cabecera, Modelo303CabeceraApi>(
        urls.MODELO_303_ID(modeloId),
        modelo303CabeceraDesdeApi,
        "Error al leer el modelo 303"
    );

export const getGeneracionModelo303: GetGeneracionModelo303 = async (modeloId) =>
    RestAPI.getItem<ResultadoGeneracionModelo303, ResultadoGeneracionModelo303Api>(
        urls.MODELO_303_GENERAR(modeloId),
        resultadoGeneracionModelo303DesdeApi,
        "Error al calcular el modelo 303"
    );

export const patchGenerarModelo303: PatchGenerarModelo303 = async (modeloId) => {
    await RestAPI.patch(
        urls.MODELO_303_GENERAR(modeloId),
        {},
        "Error al persistir las casillas del modelo 303"
    );
};

export const getExportAeatModelo303: GetExportAeatModelo303 = async (modeloId) =>
    RestAPI.blob(urls.MODELO_303_EXPORT_AEAT(modeloId), "Error al exportar fichero AEAT 303");
