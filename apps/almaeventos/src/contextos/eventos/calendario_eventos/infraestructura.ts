import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { ClausulaFiltro, Orden } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import { EventoCalendario } from "./diseño.ts";

const baseUrlEvento = `/eventos/evento`;

// Obtener eventos simplificados para el calendario
export const getEventosCalendario = async (
    filtro: ClausulaFiltro[] = [],
    orden: Orden = ["finicio", "ASC"],
    fechaInicio?: string,
    fechaFin?: string
): Promise<EventoCalendario[]> => {
    // Añadir filtros de fecha si se proporcionan
    const filtroConFechas = [...filtro];

    if (fechaInicio) {
        filtroConFechas.push(["finicio", ">=", fechaInicio]);
    }

    if (fechaFin) {
        filtroConFechas.push(["finicio", "<=", fechaFin]);
    }

    const q = criteriaQuery(filtroConFechas, orden);
    return RestAPI.get<{ datos: EventoCalendario[] }>(baseUrlEvento + q).then((respuesta) =>
        respuesta.datos.map(evento => ({
            ...evento,
            id: evento.evento_id, // Asegurar compatibilidad
            fecha: evento.fecha_inicio
        }))
    );
};