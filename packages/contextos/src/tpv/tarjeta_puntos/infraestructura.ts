import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    GetTarjetaPuntos,
    GetTarjetasPuntos,
    NuevaTarjetaPuntos,
    PatchTarjetaPuntos,
    PostTarjetaPuntos,
    TarjetaPuntos,
} from "./diseño.ts";

const BASE_URL = "/tpv/tarjeta_puntos";

interface TarjetaPuntosApi {
    id: string;
    nombre: string;
    id_fiscal: string;
    direccion: string;
    cod_postal: string | null;
    ciudad: string | null;
    provincia: string | null;
    activa: boolean;
    saldo: number;
}

const tarjetaDesdeApi = (api: TarjetaPuntosApi): TarjetaPuntos => ({
    id: api.id,
    nombre: api.nombre,
    idFiscal: api.id_fiscal,
    direccion: api.direccion,
    codPostal: api.cod_postal,
    ciudad: api.ciudad,
    provincia: api.provincia,
    activa: api.activa,
    saldo: api.saldo,
});

export const getTarjetaPuntos: GetTarjetaPuntos = async (id) =>
    RestAPI.getItem<TarjetaPuntos, TarjetaPuntosApi>(`${BASE_URL}/${id}`, tarjetaDesdeApi);

export const getTarjetasPuntos: GetTarjetasPuntos = async (criteria) =>
    RestAPI.getQuery<TarjetaPuntos, TarjetaPuntosApi>(BASE_URL, criteria, tarjetaDesdeApi);

export const postTarjetaPuntos: PostTarjetaPuntos = async (nueva: NuevaTarjetaPuntos) => {
    const respuesta = await RestAPI.post(
        BASE_URL,
        {
            id: nueva.id,
            nombre: nueva.nombre,
            id_fiscal: nueva.idFiscal,
            direccion: nueva.direccion,
            cod_postal: nueva.codPostal ?? null,
            ciudad: nueva.ciudad ?? null,
            provincia: nueva.provincia ?? null,
        },
        "Error al crear tarjeta de puntos",
    );
    return respuesta.id;
};

export const patchTarjetaPuntos: PatchTarjetaPuntos = async (id, cambios) => {
    const payload: Record<string, unknown> = {};
    if (cambios.nombre !== undefined) payload.nombre = cambios.nombre;
    if (cambios.idFiscal !== undefined) payload.id_fiscal = cambios.idFiscal;
    if (cambios.direccion !== undefined) payload.direccion = cambios.direccion;
    if (cambios.codPostal !== undefined) payload.cod_postal = cambios.codPostal;
    if (cambios.ciudad !== undefined) payload.ciudad = cambios.ciudad;
    if (cambios.provincia !== undefined) payload.provincia = cambios.provincia;
    if (cambios.activa !== undefined) payload.activa = cambios.activa;

    await RestAPI.patch(`${BASE_URL}/${id}`, payload, "Error al actualizar tarjeta de puntos");
};
