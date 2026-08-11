import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    Filtro,
    Orden,
    Paginacion,
    RespuestaLista,
} from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import {
    GetMotivoDevolucion,
    MotivoDevolucion,
    NuevoMotivoDevolucion,
    PatchMotivoDevolucion,
    PostMotivoDevolucion,
} from "./diseño.ts";

type MotivoDevolucionApi = {
    id: number | string;
    tipo: string;
    descripcion: string;
    otros: boolean;
};

const baseUrl = "/ventas/motivo_devolucion";

const motivoDevolucionDesdeAPI = (
    motivoDevolucionApi: MotivoDevolucionApi
): MotivoDevolucion => ({
    id: motivoDevolucionApi.id.toString(),
    tipo: motivoDevolucionApi.tipo,
    descripcion: motivoDevolucionApi.descripcion,
    otros: motivoDevolucionApi.otros,
});

export const getMotivosDevolucion = async (
    filtro: Filtro,
    orden: Orden,
    paginacion: Paginacion
): Promise<RespuestaLista<MotivoDevolucion>> => {
    const q = criteriaQuery(filtro, orden, paginacion);
    const respuesta = await RestAPI.get<{
        datos: MotivoDevolucionApi[];
        total: number;
    }>(`${baseUrl}${q}`);

    return {
        datos: respuesta.datos.map(motivoDevolucionDesdeAPI),
        total: respuesta.total,
    };
};

export const getMotivoDevolucion: GetMotivoDevolucion = async (id) => {
    const respuesta = await RestAPI.get<{ datos: MotivoDevolucionApi }>(
        `${baseUrl}/${id}`
    );

    return motivoDevolucionDesdeAPI(respuesta.datos);
};

export const postMotivoDevolucion: PostMotivoDevolucion = async (
    motivoDevolucion
) => {
    const respuesta = await RestAPI.post<NuevoMotivoDevolucion>(
        baseUrl,
        motivoDevolucion,
        "Error al crear motivo de devolución"
    );

    return respuesta.id.toString();
};

export const patchMotivoDevolucion: PatchMotivoDevolucion = async (
    id,
    motivoDevolucion
) => {
    await RestAPI.patch(
        `${baseUrl}/${id}`,
        {
            cambios: {
                tipo: motivoDevolucion.tipo,
                descripcion: motivoDevolucion.descripcion,
                otros: motivoDevolucion.otros,
            },
        },
        "Error al guardar motivo de devolución"
    );
};

export const deleteMotivoDevolucion = async (id: string): Promise<void> => {
    await RestAPI.delete(
        `${baseUrl}/${id}`,
        "Error al borrar motivo de devolución"
    );
};