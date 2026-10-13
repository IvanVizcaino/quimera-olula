import ApiUrls from "#/tpv/comun/urls.ts";
import { RestAPI } from "@olula/lib/api/rest_api.js";
import { Criteria } from "@olula/lib/diseño.js";
import { criteriaAQueryString } from "@olula/lib/infraestructura.js";
import {
    AgenteTpv,
    DeleteAgenteTpv,
    GetAgenteTpv,
    GetAgentesTpv,
    NuevoAgenteTpv,
    PatchAgenteTpv,
    PostAgenteTpv,
} from "./diseño.ts";

type AgenteTpvAPI = {
    id: string;
    nombre: string;
};

const baseUrl = new ApiUrls().AGENTE;

export const agenteDesdeAPI = (a: AgenteTpvAPI): AgenteTpv => ({
    id: a.id,
    nombre: a.nombre,
});

export const getAgenteTpv: GetAgenteTpv = async (id) => {
    const respuesta = await RestAPI.get<{ datos: AgenteTpvAPI }>(`${baseUrl}/${id}`);
    return agenteDesdeAPI(respuesta.datos);
};

export const getAgentesTpv: GetAgentesTpv = async (criteria: Criteria) => {
    const url = `${baseUrl}` + criteriaAQueryString(criteria);
    const respuesta = await RestAPI.get<{ datos: AgenteTpvAPI[]; total: number }>(url);
    return { datos: respuesta.datos.map(agenteDesdeAPI), total: respuesta.total };
};

export const postAgenteTpv: PostAgenteTpv = async (nuevo: NuevoAgenteTpv) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        { nombre: nuevo.nombre },
        "Error al crear el agente TPV",
    );
    return respuesta.id;
};

export const patchAgenteTpv: PatchAgenteTpv = async (id, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${id}`,
        { nombre: cambios.nombre },
        "Error al actualizar el agente TPV",
    );
};

export const deleteAgenteTpv: DeleteAgenteTpv = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, "Error al borrar el agente TPV");
};
