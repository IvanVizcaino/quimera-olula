import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "#/contabilidad/comun/urls.ts";
import { idRegistro340 } from "./dominio.ts";
import {
    DiffTotalModelo340,
    GetDatosModelo340,
    GetExportAeatModelo340,
    GetGeneracionModelo340,
    PatchGenerarModelo340,
    Registro340,
    ResultadoGeneracionModelo340,
} from "./diseño.ts";

const urls = new ApiUrls();

interface Registro340Api {
    tipolibro: string;
    idenfactura: string;
    apellidosnomrs: string;
    cifnif: string | null;
    baseimponible: number;
    cuotaimpuesto: number;
    operacion: string | null;
}

interface DiffTotalModelo340Api {
    clave: string;
    almacenado: number;
    calculado: number;
    delta: number;
}

interface ResultadoGeneracionModelo340Api {
    modelo_id: number;
    codejercicio: string;
    registros: number;
    baseimponible: number;
    cuotaimpuesto: number;
    totalfacturas: number;
    emitidas: Registro340Api[];
    recibidas: Registro340Api[];
    diffs_totales: DiffTotalModelo340Api[];
    coincide: boolean;
}

export const registro340DesdeApi = (api: Registro340Api): Registro340 => ({
    id: idRegistro340(api),
    tipolibro: api.tipolibro,
    idenfactura: api.idenfactura,
    apellidosnomrs: api.apellidosnomrs,
    cifnif: api.cifnif,
    baseimponible: api.baseimponible,
    cuotaimpuesto: api.cuotaimpuesto,
    operacion: api.operacion,
});

export const diffTotalModelo340DesdeApi = (api: DiffTotalModelo340Api): DiffTotalModelo340 => ({
    id: api.clave,
    clave: api.clave,
    almacenado: api.almacenado,
    calculado: api.calculado,
    delta: api.delta,
});

export const resultadoGeneracionModelo340DesdeApi = (
    api: ResultadoGeneracionModelo340Api
): ResultadoGeneracionModelo340 => ({
    modeloId: api.modelo_id,
    codejercicio: api.codejercicio,
    registros: api.registros,
    baseimponible: api.baseimponible,
    cuotaimpuesto: api.cuotaimpuesto,
    totalfacturas: api.totalfacturas,
    emitidas: api.emitidas.map(registro340DesdeApi),
    recibidas: api.recibidas.map(registro340DesdeApi),
    diffsTotales: api.diffs_totales.map(diffTotalModelo340DesdeApi),
    coincide: api.coincide,
});

export const getGeneracionModelo340: GetGeneracionModelo340 = async (modeloId) =>
    RestAPI.getItem<ResultadoGeneracionModelo340, ResultadoGeneracionModelo340Api>(
        urls.MODELO_340_GENERAR(modeloId),
        resultadoGeneracionModelo340DesdeApi,
        "Error al calcular el modelo 340"
    );

export const patchGenerarModelo340: PatchGenerarModelo340 = async (modeloId) => {
    await RestAPI.patch(urls.MODELO_340_GENERAR(modeloId), {}, "Error al persistir el modelo 340");
};

export const getDatosModelo340: GetDatosModelo340 = async (modeloId) =>
    RestAPI.getLista<Registro340, Registro340Api>(
        urls.MODELO_340_DATOS(modeloId),
        registro340DesdeApi,
        "Error al listar facturas del modelo 340"
    );

export const getExportAeatModelo340: GetExportAeatModelo340 = async (modeloId) =>
    RestAPI.blob(urls.MODELO_340_EXPORT_AEAT(modeloId), "Error al exportar fichero AEAT 340");
