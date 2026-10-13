import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "#/contabilidad/comun/urls.ts";
import { payloadCerrarEjercicioAApi } from "./dominio.ts";
import {
    PatchBorrarAsientoAperturaEjercicio,
    PatchCerrarEjercicio,
    PatchCrearAsientoAperturaEjercicio,
    PatchReabrirEjercicio,
    ResultadoCierreEjercicio,
} from "./diseño.ts";

interface ResultadoCierreEjercicioApi {
    ejercicio_id: string;
    estado: string;
    id_asiento_pyg: number | null;
    id_asiento_cierre: number | null;
    id_asiento_apertura: number | null;
}

const respuestaDirecta = <TApi, T>(api: TApi | { datos: TApi }, map: (a: TApi) => T): T => {
    const datos = api && typeof api === "object" && "datos" in api ? api.datos : api;
    return map(datos as TApi);
};

export const resultadoCierreEjercicioDesdeApi = (api: ResultadoCierreEjercicioApi): ResultadoCierreEjercicio => ({
    ejercicioId: api.ejercicio_id,
    estado: api.estado,
    idAsientoPyg: api.id_asiento_pyg,
    idAsientoCierre: api.id_asiento_cierre,
    idAsientoApertura: api.id_asiento_apertura,
});

const urlEjercicio = (id: string) => new ApiUrls().EJERCICIO(id);

export const patchCerrarEjercicio: PatchCerrarEjercicio = async (ejercicioId, payload) => {
    const respuesta = (await RestAPI.patch(
        `${urlEjercicio(ejercicioId)}/cerrar`,
        payloadCerrarEjercicioAApi(payload),
        "Error al cerrar ejercicio"
    )) as unknown as ResultadoCierreEjercicioApi | { datos: ResultadoCierreEjercicioApi };
    return respuestaDirecta(respuesta, resultadoCierreEjercicioDesdeApi);
};

export const patchReabrirEjercicio: PatchReabrirEjercicio = async (ejercicioId) => {
    const respuesta = (await RestAPI.patch(
        `${urlEjercicio(ejercicioId)}/reabrir`,
        {},
        "Error al reabrir ejercicio"
    )) as unknown as ResultadoCierreEjercicioApi | { datos: ResultadoCierreEjercicioApi };
    return respuestaDirecta(respuesta, resultadoCierreEjercicioDesdeApi);
};

export const patchCrearAsientoAperturaEjercicio: PatchCrearAsientoAperturaEjercicio = async (
    ejercicioDestinoId,
    idAsientoCierre
) => {
    const respuesta = (await RestAPI.patch(
        `${urlEjercicio(ejercicioDestinoId)}/asiento_apertura`,
        { id_asiento_cierre: idAsientoCierre },
        "Error al crear asiento de apertura"
    )) as unknown as ResultadoCierreEjercicioApi | { datos: ResultadoCierreEjercicioApi };
    return respuestaDirecta(respuesta, resultadoCierreEjercicioDesdeApi);
};

export const patchBorrarAsientoAperturaEjercicio: PatchBorrarAsientoAperturaEjercicio = async (ejercicioId) => {
    const respuesta = (await RestAPI.patch(
        `${urlEjercicio(ejercicioId)}/borrar_asiento_apertura`,
        {},
        "Error al borrar asiento de apertura"
    )) as unknown as ResultadoCierreEjercicioApi | { datos: ResultadoCierreEjercicioApi };
    return respuestaDirecta(respuesta, resultadoCierreEjercicioDesdeApi);
};
