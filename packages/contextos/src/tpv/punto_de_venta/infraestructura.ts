import ApiUrls from "#/tpv/comun/urls.ts";
import { RestAPI } from "@olula/lib/api/rest_api.js";
import { Criteria } from "@olula/lib/diseño.js";
import { criteriaAQueryString } from "@olula/lib/infraestructura.js";
import {
    DeletePuntoVentaTpv,
    GetPuntoVentaTpv,
    GetPuntosVentaTpv,
    NuevoPuntoVentaTpv,
    PatchPuntoVentaTpv,
    PostPuntoVentaTpv,
    PuntoVentaTpv,
} from "./diseño.ts";

type PuntoVentaTpvAPI = {
    id: string;
    nombre: string;
    agente_id: string | null;
    serie_id: string | null;
    tienda_id: string | null;
};

const baseUrl = new ApiUrls().PUNTO_VENTA;

export const puntoVentaDesdeAPI = (a: PuntoVentaTpvAPI): PuntoVentaTpv => ({
    id: a.id,
    nombre: a.nombre,
    agenteId: a.agente_id,
    serieId: a.serie_id,
    tiendaId: a.tienda_id,
});

export const getPuntoVentaTpv: GetPuntoVentaTpv = async (id) => {
    const respuesta = await RestAPI.get<{ datos: PuntoVentaTpvAPI }>(`${baseUrl}/${id}`);
    return puntoVentaDesdeAPI(respuesta.datos);
};

export const getPuntosVentaTpv: GetPuntosVentaTpv = async (criteria: Criteria) => {
    const url = `${baseUrl}` + criteriaAQueryString(criteria);
    const respuesta = await RestAPI.get<{ datos: PuntoVentaTpvAPI[]; total: number }>(url);
    return {
        datos: respuesta.datos.map(puntoVentaDesdeAPI),
        total: respuesta.total,
    };
};

export const postPuntoVentaTpv: PostPuntoVentaTpv = async (nuevo: NuevoPuntoVentaTpv) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        {
            id: nuevo.id,
            nombre: nuevo.nombre,
            serie_id: nuevo.serieId,
            tienda_id: nuevo.tiendaId,
            agente_id: nuevo.agenteId,
        },
        "Error al crear el punto de venta TPV",
    );
    return respuesta.id;
};

export const patchPuntoVentaTpv: PatchPuntoVentaTpv = async (id, cambios) => {
    const body: Record<string, unknown> = {};
    if (cambios.nombre !== undefined) body.nombre = cambios.nombre;
    if (cambios.serieId !== undefined) body.serie_id = cambios.serieId;
    if (cambios.tiendaId !== undefined) body.tienda_id = cambios.tiendaId;
    if (cambios.agenteId !== undefined) body.agente_id = cambios.agenteId;
    await RestAPI.patch(`${baseUrl}/${id}`, body, "Error al actualizar el punto de venta TPV");
};

export const deletePuntoVentaTpv: DeletePuntoVentaTpv = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, "Error al borrar el punto de venta TPV");
};
