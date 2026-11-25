import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import { horaAApi, horaCorta } from "../comun/dominio.ts";
import {
    CambiosHorario,
    DeleteHorario,
    GetHorario,
    GetHorarios,
    Horario,
    HorasHorario,
    NuevoHorario,
    PatchHorario,
    PostHorario,
} from "./diseño.ts";

const baseUrl = `/produccion/horario`;

interface HorasHorarioApi {
    hora_entrada_manana: string | null;
    hora_salida_manana: string | null;
    hora_entrada_tarde: string | null;
    hora_salida_tarde: string | null;
}

export interface HorarioApi extends HorasHorarioApi {
    id: string;
    descripcion: string | null;
    tiempo: number | null;
}

export const horarioDesdeApi = (api: HorarioApi): Horario => ({
    id: api.id,
    descripcion: api.descripcion ?? "",
    horaEntradaManana: horaCorta(api.hora_entrada_manana),
    horaSalidaManana: horaCorta(api.hora_salida_manana),
    horaEntradaTarde: horaCorta(api.hora_entrada_tarde),
    horaSalidaTarde: horaCorta(api.hora_salida_tarde),
    tiempo: Number(api.tiempo ?? 0),
});

const horasAApi = (h: HorasHorario): HorasHorarioApi => ({
    hora_entrada_manana: horaAApi(h.horaEntradaManana),
    hora_salida_manana: horaAApi(h.horaSalidaManana),
    hora_entrada_tarde: horaAApi(h.horaEntradaTarde),
    hora_salida_tarde: horaAApi(h.horaSalidaTarde),
});

export const nuevoHorarioAApi = (n: NuevoHorario) => ({
    id: n.id.trim(),
    descripcion: n.descripcion,
    ...horasAApi(n),
});

const CAMPOS_HORA = ["horaEntradaManana", "horaSalidaManana", "horaEntradaTarde", "horaSalidaTarde"] as const;

/** Si cambia alguna hora se mandan las cuatro: el servidor valida el horario completo. */
export const cambiosHorarioAApi = (c: CambiosHorario) => ({
    ...(c.descripcion !== undefined ? { descripcion: c.descripcion ?? "" } : {}),
    ...(CAMPOS_HORA.some((campo) => c[campo] !== undefined)
        ? horasAApi({
            horaEntradaManana: c.horaEntradaManana ?? "",
            horaSalidaManana: c.horaSalidaManana ?? "",
            horaEntradaTarde: c.horaEntradaTarde ?? "",
            horaSalidaTarde: c.horaSalidaTarde ?? "",
        })
        : {}),
});

export const getHorario: GetHorario = async (id) =>
    RestAPI.getItem<Horario, HorarioApi>(`${baseUrl}/${encodeURIComponent(id)}`, horarioDesdeApi);

export const getHorarios: GetHorarios = async (criteria: Criteria) =>
    RestAPI.getQuery<Horario, HorarioApi>(baseUrl, criteria, horarioDesdeApi);

export const postHorario: PostHorario = async (nuevo) => {
    const respuesta = await RestAPI.post(baseUrl, nuevoHorarioAApi(nuevo), "Error al crear el horario");
    return respuesta.id;
};

export const patchHorario: PatchHorario = async (id, cambios) => {
    await RestAPI.patch(`${baseUrl}/${encodeURIComponent(id)}`, cambiosHorarioAApi(cambios), "Error al guardar el horario");
};

export const deleteHorario: DeleteHorario = async (id) => {
    await RestAPI.delete(`${baseUrl}/${encodeURIComponent(id)}`, "Error al borrar el horario");
};
