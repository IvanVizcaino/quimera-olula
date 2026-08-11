import { RestAPI } from "@olula/lib/api/rest_api.js";
import { Filtro, Orden, Paginacion } from "@olula/lib/diseño.js";
import { criteriaQuery } from "@olula/lib/infraestructura.js";
import RrhhAreaEmpleado_Urls from "./comun/urls.ts";
import {
    AnulacionJornada,
    CambiosJornada,
    GetJornada,
    GetJornadas,
    NuevaJornada,
    NuevaPausa,
    PatchAnularJornada,
    PatchJornada,
    PatchPausarJornada,
    PatchReactivarJornada,
    PausaJornada,
    ReactivacionJornada,
    RegistroJornada,
} from "./diseño.ts";

// Tipos API (snake_case)
interface PausaJornadaApi {
    id: string;
    hora_inicio: string;
    hora_fin: string | null;
    causa: string;
}

interface RegistroJornadaApi {
    id: string;
    empleado_id: string;
    empleado: string;
    fecha: string;
    hora_entrada: string | null;
    hora_salida: string | null;
    estado: string;
    observaciones: string | null;
    tiempo_total_pausas: number;
    minutos_jornada: number;
    estado_borrador: string | null;
    pausas?: PausaJornadaApi[];
}

// Mappers
const pausaDesdeApi = (p: PausaJornadaApi): PausaJornada => ({
    id: p.id,
    horaInicio: p.hora_inicio,
    horaFin: p.hora_fin,
    causa: p.causa,
});

export const registroJornadaDesdeApi = (j: RegistroJornadaApi): RegistroJornada => ({
    id: j.id,
    empleadoId: j.empleado_id,
    empleado: j.empleado,
    fecha: new Date(j.fecha),
    horaEntrada: j.hora_entrada,
    horaSalida: j.hora_salida,
    estado: j.estado as RegistroJornada['estado'],
    observaciones: j.observaciones,
    tiempoTotalPausas: j.tiempo_total_pausas,
    minutosJornada: j.minutos_jornada,
    estadoBorrador: j.estado_borrador as RegistroJornada['estadoBorrador'],
    pausas: (j.pausas ?? []).map(pausaDesdeApi),
});

const baseUrl = new RrhhAreaEmpleado_Urls().JORNADA;

export const getJornadas: GetJornadas = async (
    filtro: Filtro,
    orden: Orden,
    paginacion: Paginacion
) => {
    const q = criteriaQuery(filtro, orden, paginacion);
    const respuesta = await RestAPI.get<{ datos: RegistroJornadaApi[]; total: number; media_minutos: number }>(baseUrl + q);
    return {
        datos: respuesta.datos.map(registroJornadaDesdeApi),
        total: respuesta.total,
        mediaMinutos: respuesta.media_minutos,
    };
};

export const getJornada: GetJornada = async (id) => {
    return RestAPI.get<{ datos: RegistroJornadaApi }>(`${baseUrl}/${id}`)
        .then((respuesta) => registroJornadaDesdeApi(respuesta.datos));
};

export const postJornada = async (jornada: Omit<NuevaJornada, 'empleadoId'>): Promise<string> => {
    const respuesta = await RestAPI.post(
        baseUrl,
        {
            // empleado_id: jornada.empleadoId,
            fecha: jornada.fecha,
            hora_entrada: jornada.horaEntrada,
            hora_salida: jornada.horaSalida,
            observaciones: jornada.observaciones,
        },
        "Error al crear la jornada"
    );
    return respuesta.id as string;
};

export const patchJornada: PatchJornada = async (id, cambios: CambiosJornada) => {
    await RestAPI.patch(
        `${baseUrl}/${id}`,
        {
            hora_entrada: cambios.horaEntrada,
            hora_salida: cambios.horaSalida,
            observaciones: cambios.observaciones,
            pausas: cambios.pausas.map((p) => ({
                id: p.id,
                hora_inicio: p.horaInicio,
                hora_fin: p.horaFin,
                causa: p.causa,
            })),
        },
        "Error al modificar la jornada"
    );
};

export const patchAnularJornada: PatchAnularJornada = async (id, anulacion: AnulacionJornada) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/anular`,
        { motivo: anulacion.motivo },
        "Error al anular la jornada"
    );
};

export const patchPausarJornada: PatchPausarJornada = async (id, pausa: NuevaPausa) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/pausar`,
        {
            hora_inicio: pausa.horaInicio,
            causa: pausa.causa,
        },
        "Error al pausar la jornada"
    );
};

export const patchReactivarJornada: PatchReactivarJornada = async (id, reactivacion: ReactivacionJornada) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/reactivar`,
        { hora_fin: reactivacion.horaFin },
        "Error al reactivar la jornada"
    );
};
