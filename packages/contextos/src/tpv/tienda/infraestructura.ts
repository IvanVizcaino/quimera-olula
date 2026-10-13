import ApiUrls from "#/tpv/comun/urls.ts";
import { RestAPI } from "@olula/lib/api/rest_api.js";
import { Criteria } from "@olula/lib/diseño.js";
import { criteriaAQueryString } from "@olula/lib/infraestructura.js";
import { GetTiendasTpv, TiendaTpv } from "./diseño.ts";

type TiendaTpvAPI = {
    id: string;
    nombre: string;
};

const baseUrl = new ApiUrls().TIENDA;

export const tiendaDesdeAPI = (t: TiendaTpvAPI): TiendaTpv => ({
    id: t.id,
    nombre: t.nombre,
});

export const getTiendasTpv: GetTiendasTpv = async (criteria: Criteria) => {
    const url = `${baseUrl}` + criteriaAQueryString(criteria);
    const respuesta = await RestAPI.get<{ datos: TiendaTpvAPI[]; total: number }>(url);
    return { datos: respuesta.datos.map(tiendaDesdeAPI), total: respuesta.total };
};
