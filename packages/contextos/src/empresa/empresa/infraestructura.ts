import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Direccion } from "../../comun/diseño.js";
import Empresa_Urls from "../comun/urls.js";
import {
    CambiosEmpresa,
    DeleteEmpresa,
    Empresa,
    GetEmpresa,
    GetEmpresas,
    NuevaEmpresa,
    PatchEmpresa,
    PostEmpresa,
} from "./diseño.js";

export interface EmpresaApi {
    id: string;
    nombre: string;
    cif_nif: string;
    administrador: string;
    direccion: Direccion;
    ejercicio_id: string;
    telefono: string | null;
    email: string | null;
    web: string | null;
    serie_id: string | null;
    forma_pago_id: string | null;
    divisa_id: string | null;
    almacen_id: string | null;
}

export interface NuevaEmpresaApi {
    nombre: string;
    cif_nif: string;
    administrador: string;
    direccion: Direccion;
    ejercicio_id: string;
    telefono?: string;
    email?: string;
    web?: string;
    serie_id?: string;
    forma_pago_id?: string;
    divisa_id?: string;
    almacen_id?: string;
}

type CambiosEmpresaApi = Partial<EmpresaApi>;

const baseUrl = new Empresa_Urls().EMPRESA;

/**
 * Compone el objeto `direccion` (snake_case, anidado) desde los campos
 * aplanados del dominio.
 */
const direccionAApi = (e: {
    tipoVia: string;
    nombreVia: string;
    numero: string;
    otros: string;
    codPostal: string;
    ciudad: string;
    provinciaId: number;
    provincia: string;
    paisId: string;
    apartado: string;
    telefonoDireccion: string;
}): Direccion => ({
    tipo_via: e.tipoVia,
    nombre_via: e.nombreVia,
    numero: e.numero,
    otros: e.otros,
    cod_postal: e.codPostal,
    ciudad: e.ciudad,
    provincia_id: e.provinciaId,
    provincia: e.provincia,
    pais_id: e.paisId,
    apartado: e.apartado,
    telefono: e.telefonoDireccion,
});

/**
 * Mapea respuesta de API a dominio (snake_case → camelCase),
 * aplanando el objeto `direccion`.
 */
export const empresaDesdeApi = (api: EmpresaApi): Empresa => ({
    id: api.id,
    nombre: api.nombre,
    cifNif: api.cif_nif,
    administrador: api.administrador,
    ejercicioId: api.ejercicio_id,
    telefono: api.telefono ?? "",
    email: api.email ?? "",
    web: api.web ?? "",
    serieId: api.serie_id ?? "",
    formaPagoId: api.forma_pago_id ?? "",
    divisaId: api.divisa_id ?? "",
    almacenId: api.almacen_id ?? "",

    tipoVia: api.direccion?.tipo_via ?? "",
    nombreVia: api.direccion?.nombre_via ?? "",
    numero: api.direccion?.numero ?? "",
    otros: api.direccion?.otros ?? "",
    codPostal: api.direccion?.cod_postal ?? "",
    ciudad: api.direccion?.ciudad ?? "",
    provinciaId: api.direccion?.provincia_id ?? 0,
    provincia: api.direccion?.provincia ?? "",
    paisId: api.direccion?.pais_id ?? "",
    apartado: api.direccion?.apartado ?? "",
    telefonoDireccion: api.direccion?.telefono ?? "",
});

/**
 * Mapea datos de creación de dominio a API (camelCase → snake_case).
 */
export const nuevaEmpresaAApi = (e: NuevaEmpresa): NuevaEmpresaApi => ({
    nombre: e.nombre,
    cif_nif: e.cifNif,
    administrador: e.administrador,
    ejercicio_id: e.ejercicioId,
    direccion: direccionAApi(e),
    telefono: e.telefono || undefined,
    email: e.email || undefined,
    web: e.web || undefined,
    serie_id: e.serieId || undefined,
    forma_pago_id: e.formaPagoId || undefined,
    divisa_id: e.divisaId || undefined,
    almacen_id: e.almacenId || undefined,
});

const cambiosEmpresaAApi = (e: CambiosEmpresa): CambiosEmpresaApi => {
    const cambios: CambiosEmpresaApi = {};
    if (e.nombre !== undefined) cambios["nombre"] = e.nombre;
    if (e.cifNif !== undefined) cambios["cif_nif"] = e.cifNif;
    if (e.administrador !== undefined) cambios["administrador"] = e.administrador;
    if (e.ejercicioId !== undefined) cambios["ejercicio_id"] = e.ejercicioId;
    if (e.telefono !== undefined) cambios["telefono"] = e.telefono;
    if (e.email !== undefined) cambios["email"] = e.email;
    if (e.web !== undefined) cambios["web"] = e.web;
    if (e.serieId !== undefined) cambios["serie_id"] = e.serieId;
    if (e.formaPagoId !== undefined) cambios["forma_pago_id"] = e.formaPagoId;
    if (e.divisaId !== undefined) cambios["divisa_id"] = e.divisaId;
    if (e.almacenId !== undefined) cambios["almacen_id"] = e.almacenId;

    // Si viene algún campo de dirección, se reconstruye el objeto completo.
    // El auto-guardado envía el modelo entero, por lo que todos estarán presentes.
    const camposDireccion = [
        e.tipoVia, e.nombreVia, e.numero, e.otros, e.codPostal, e.ciudad,
        e.provinciaId, e.provincia, e.paisId, e.apartado, e.telefonoDireccion,
    ];
    if (camposDireccion.some((c) => c !== undefined)) {
        cambios["direccion"] = direccionAApi({
            tipoVia: e.tipoVia ?? "",
            nombreVia: e.nombreVia ?? "",
            numero: e.numero ?? "",
            otros: e.otros ?? "",
            codPostal: e.codPostal ?? "",
            ciudad: e.ciudad ?? "",
            provinciaId: e.provinciaId ?? 0,
            provincia: e.provincia ?? "",
            paisId: e.paisId ?? "",
            apartado: e.apartado ?? "",
            telefonoDireccion: e.telefonoDireccion ?? "",
        });
    }
    return cambios;
};

export const getEmpresa: GetEmpresa = async (id) => {
    return await RestAPI.getItem<Empresa, EmpresaApi>(
        `${baseUrl}/${id}`,
        empresaDesdeApi,
    );
};

export const getEmpresas: GetEmpresas = async (criteria) => {
    return await RestAPI.getQuery<Empresa, EmpresaApi>(
        baseUrl,
        criteria,
        empresaDesdeApi,
    );
};

export const postEmpresa: PostEmpresa = async (nueva) => {
    const respuesta = await RestAPI.post<NuevaEmpresaApi>(
        baseUrl,
        nuevaEmpresaAApi(nueva),
        "Error al crear empresa",
    );
    return respuesta.id;
};

export const patchEmpresa: PatchEmpresa = async (id, cambios) => {
    await RestAPI.patch<CambiosEmpresaApi>(
        `${baseUrl}/${id}`,
        cambiosEmpresaAApi(cambios),
        "Error al actualizar empresa",
    );
};

export const deleteEmpresa: DeleteEmpresa = async (id) => {
    await RestAPI.delete(
        `${baseUrl}/${id}`,
        "Error al eliminar empresa",
    );
};
