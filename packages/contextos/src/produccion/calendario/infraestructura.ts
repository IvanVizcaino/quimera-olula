import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { horaCorta } from "../comun/dominio.ts";
import {
    DiaCalendario,
    GetCalendarioRango,
    PatchDiaCalendario,
    PostGenerarCalendario,
    ResultadoGeneracion,
} from "./diseño.ts";

const baseUrl = `/produccion/calendario`;

export interface DiaCalendarioApi {
    fecha: string;
    descripcion: string | null;
    horario_id: string | null;
    horario: string | null;
    hora_entrada_manana: string | null;
    hora_salida_manana: string | null;
    hora_entrada_tarde: string | null;
    hora_salida_tarde: string | null;
    tiempo: number | null;
}

export const diaCalendarioDesdeApi = (api: DiaCalendarioApi): DiaCalendario => ({
    id: api.fecha.slice(0, 10),
    fecha: api.fecha.slice(0, 10),
    descripcion: api.descripcion ?? "",
    horarioId: api.horario_id ?? "",
    horario: api.horario ?? "",
    horaEntradaManana: horaCorta(api.hora_entrada_manana),
    horaSalidaManana: horaCorta(api.hora_salida_manana),
    horaEntradaTarde: horaCorta(api.hora_entrada_tarde),
    horaSalidaTarde: horaCorta(api.hora_salida_tarde),
    tiempo: Number(api.tiempo ?? 0),
});

export const getCalendarioRango: GetCalendarioRango = async (desde, hasta) => {
    const respuesta = await RestAPI.get<{ datos: DiaCalendarioApi[] }>(
        `${baseUrl}/rango/${desde}/${hasta}`, "Error al leer el calendario");
    return respuesta.datos.map(diaCalendarioDesdeApi);
};

export const postGenerarCalendario: PostGenerarCalendario = async (g) =>
    RestAPI.query<object, ResultadoGeneracion>(
        `${baseUrl}/generar`,
        {
            desde: g.desde,
            hasta: g.hasta,
            horario_laboral_id: g.horarioLaboralId,
            horario_sabado_id: g.horarioSabadoId || null,
            horario_domingo_id: g.horarioDomingoId || null,
        },
        "Error al generar el calendario");

export const patchDiaCalendario: PatchDiaCalendario = async (fecha, horarioId) => {
    await RestAPI.patch(`${baseUrl}/${fecha}`, { horario_id: horarioId || null }, "Error al cambiar el día");
};
