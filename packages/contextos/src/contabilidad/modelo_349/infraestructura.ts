import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "#/contabilidad/comun/urls.ts";
import { idOperacion349 } from "./dominio.ts";
import {
    DiffTotalModelo349,
    GetDatosModelo349,
    GetExportAeatModelo349,
    GetGeneracionModelo349,
    Operacion349,
    PatchGenerarModelo349,
    ResultadoGeneracionModelo349,
} from "./diseño.ts";

const urls = new ApiUrls();

interface Operacion349Api {
    clave: string;
    codcliente: string | null;
    codproveedor: string | null;
    codpais: string;
    codue: string;
    cifnif: string;
    nombre: string;
    baseimponible: number;
}

interface DiffTotalModelo349Api {
    clave: string;
    almacenado: number;
    calculado: number;
    delta: number;
}

interface ResultadoGeneracionModelo349Api {
    modelo_id: number;
    codejercicio: string;
    numtotaloi: number;
    importetotaloi: number;
    numtotaloirec: number;
    importetotaloirec: number;
    operaciones: Operacion349Api[];
    diffs_totales: DiffTotalModelo349Api[];
    diffs_operaciones: Record<string, unknown>[];
    coincide: boolean;
}

export const operacion349DesdeApi = (api: Operacion349Api): Operacion349 => ({
    id: idOperacion349(api),
    clave: api.clave,
    codcliente: api.codcliente,
    codproveedor: api.codproveedor,
    codpais: api.codpais,
    codue: api.codue,
    cifnif: api.cifnif,
    nombre: api.nombre,
    baseimponible: api.baseimponible,
});

export const diffTotalModelo349DesdeApi = (api: DiffTotalModelo349Api): DiffTotalModelo349 => ({
    id: api.clave,
    clave: api.clave,
    almacenado: api.almacenado,
    calculado: api.calculado,
    delta: api.delta,
});

export const resultadoGeneracionModelo349DesdeApi = (
    api: ResultadoGeneracionModelo349Api
): ResultadoGeneracionModelo349 => ({
    modeloId: api.modelo_id,
    codejercicio: api.codejercicio,
    numtotaloi: api.numtotaloi,
    importetotaloi: api.importetotaloi,
    numtotaloirec: api.numtotaloirec,
    importetotaloirec: api.importetotaloirec,
    operaciones: api.operaciones.map(operacion349DesdeApi),
    diffsTotales: api.diffs_totales.map(diffTotalModelo349DesdeApi),
    diffsOperaciones: api.diffs_operaciones,
    coincide: api.coincide,
});

export const getGeneracionModelo349: GetGeneracionModelo349 = async (modeloId) =>
    RestAPI.getItem<ResultadoGeneracionModelo349, ResultadoGeneracionModelo349Api>(
        urls.MODELO_349_GENERAR(modeloId),
        resultadoGeneracionModelo349DesdeApi,
        "Error al calcular el modelo 349"
    );

export const patchGenerarModelo349: PatchGenerarModelo349 = async (modeloId) => {
    await RestAPI.patch(urls.MODELO_349_GENERAR(modeloId), {}, "Error al persistir el modelo 349");
};

export const getDatosModelo349: GetDatosModelo349 = async (modeloId) =>
    RestAPI.getLista<Operacion349, Operacion349Api>(
        urls.MODELO_349_DATOS(modeloId),
        operacion349DesdeApi,
        "Error al listar operaciones del modelo 349"
    );

export const getExportAeatModelo349: GetExportAeatModelo349 = async (modeloId) =>
    RestAPI.blob(urls.MODELO_349_EXPORT_AEAT(modeloId), "Error al exportar fichero AEAT 349");
