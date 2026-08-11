import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Filtro, Orden } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import { Empresa } from "./diseño.ts";

const baseUrlEmpresa = `/crm/empresa`;

export const getEmpresa = async (id: string): Promise<Empresa> =>
    await RestAPI.get<{ datos: Empresa }>(`${baseUrlEmpresa}/${id}`).then((respuesta) => respuesta.datos);

export const getEmpresas = async (filtro: Filtro, orden: Orden): Promise<Empresa[]> => {
    const q = criteriaQuery(filtro, orden);
    return RestAPI.get<{ datos: Empresa[] }>(baseUrlEmpresa + q).then((respuesta) => respuesta.datos);
};

export const postEmpresa = async (empresa: Partial<Empresa>): Promise<string> => {
    return await RestAPI.post(baseUrlEmpresa, empresa).then((respuesta) => respuesta.id);
};

export const patchEmpresa = async (id: string, empresa: Partial<Empresa>): Promise<void> => {
    // Quitar es para probar
    const empresaSinNulls = Object.fromEntries(
        Object.entries(empresa).map(([k, v]) => [k, v === null ? "" : v])
    );
    await RestAPI.patch(`${baseUrlEmpresa}/${id}`, empresaSinNulls);
};

export const deleteEmpresa = async (id: string): Promise<void> =>
    await RestAPI.delete(`${baseUrlEmpresa}/${id}`);

