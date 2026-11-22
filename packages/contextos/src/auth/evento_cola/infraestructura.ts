import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import { EventoCola, EventoColaApi, EventoColaDetalle, EventoColaDetalleApi } from "./diseño.ts";

const baseUrl = "/comun/evento_cola";

export const eventoColaDesdeApi = (e: EventoColaApi): EventoCola => ({
    id: String(e.id),
    padreId: e.padre_id,
    colaId: e.cola_id,
    tipo: e.tipo,
    estado: e.estado,
    numIntento: e.num_intento,
    usuarioId: e.usuario_id,
    clave: e.clave,
    creacion: e.timestamp_creacion,
    programada: e.timestamp_ejecucion_programada,
    inicio: e.timestamp_inicio,
    fin: e.timestamp_fin,
    error: e.error,
});

export const eventoColaDetalleDesdeApi = (e: EventoColaDetalleApi): EventoColaDetalle => ({
    ...eventoColaDesdeApi(e),
    payload: e.payload,
    datosError: e.datos_error,
});

export const getEventosCola = (criteria: Criteria) =>
    RestAPI.getQuery<EventoCola, EventoColaApi>(baseUrl, criteria, eventoColaDesdeApi,
        "Error al obtener la cola de eventos");

export const getEventoCola = async (id: string): Promise<EventoColaDetalle> =>
    eventoColaDetalleDesdeApi(
        (await RestAPI.get<{ datos: EventoColaDetalleApi }>(`${baseUrl}/${id}`, "Error al obtener el evento")).datos);

/** «Reiniciar proceso»: devuelve el id del evento original, que queda pendiente. */
export const reiniciarEventoCola = async (id: string): Promise<string> => {
    await RestAPI.patch(`${baseUrl}/${id}/reiniciar`, {}, "No se ha podido reiniciar el evento");
    return id;
};
