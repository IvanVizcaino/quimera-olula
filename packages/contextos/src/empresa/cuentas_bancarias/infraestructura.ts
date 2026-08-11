import { RestAPI } from "@olula/lib/api/rest_api.ts";
import Empresa_Urls from "../comun/urls.js";
import {
    CambiosCuentaBancaria,
    CuentaBancaria,
    DeleteCuentaBancaria,
    GetCuentaBancaria,
    GetCuentasBancarias,
    NuevaCuentaBancaria,
    PatchCuentaBancaria,
    PostCuentaBancaria,
} from "./diseño.js";

export interface CuentaBancariaApi {
    id: string;
    codigo_cuenta: string;
    pais_id: string;
    obsoleta: boolean;
    empresa_id: string | null;
    descripcion: string | null;
    iban: string | null;
    bic: string | null;
    entidad: string | null;
    agencia: string | null;
    digito_control: string | null;
    cuenta: string | null;
}

export interface NuevaCuentaBancariaApi {
    codigo_cuenta: string;
    pais_id: string;
    empresa_id?: string;
    descripcion?: string;
    iban?: string;
    bic?: string;
    entidad?: string;
    agencia?: string;
    digito_control?: string;
    cuenta?: string;
}

type CambiosCuentaBancariaApi = Partial<CuentaBancariaApi>;

const baseUrl = new Empresa_Urls().CUENTAS_BANCARIAS;

/**
 * Mapea respuesta de API a interfaz del dominio (snake_case → camelCase).
 * Los campos opcionales del backend (null) se normalizan a cadena vacía.
 */
export const cuentaBancariaDesdeApi = (api: CuentaBancariaApi): CuentaBancaria => ({
    id: api.id,
    codigoCuenta: api.codigo_cuenta,
    paisId: api.pais_id,
    obsoleta: api.obsoleta,
    empresaId: api.empresa_id ?? "",
    descripcion: api.descripcion ?? "",
    iban: api.iban ?? "",
    bic: api.bic ?? "",
    entidad: api.entidad ?? "",
    agencia: api.agencia ?? "",
    digitoControl: api.digito_control ?? "",
    cuenta: api.cuenta ?? "",
});

/**
 * Mapea datos de creación de dominio a API (camelCase → snake_case).
 */
export const nuevaCuentaBancariaAApi = (c: NuevaCuentaBancaria): NuevaCuentaBancariaApi => ({
    codigo_cuenta: c.codigoCuenta,
    pais_id: c.paisId,
    empresa_id: c.empresaId || undefined,
    descripcion: c.descripcion || undefined,
    iban: c.iban || undefined,
    bic: c.bic || undefined,
    entidad: c.entidad || undefined,
    agencia: c.agencia || undefined,
    digito_control: c.digitoControl || undefined,
    cuenta: c.cuenta || undefined,
});

const cambiosCuentaBancariaAApi = (c: CambiosCuentaBancaria): CambiosCuentaBancariaApi => {
    const cambios: CambiosCuentaBancariaApi = {};
    if (c.codigoCuenta !== undefined) cambios["codigo_cuenta"] = c.codigoCuenta;
    if (c.paisId !== undefined) cambios["pais_id"] = c.paisId;
    if (c.obsoleta !== undefined) cambios["obsoleta"] = c.obsoleta;
    if (c.empresaId !== undefined) cambios["empresa_id"] = c.empresaId;
    if (c.descripcion !== undefined) cambios["descripcion"] = c.descripcion;
    if (c.iban !== undefined) cambios["iban"] = c.iban;
    if (c.bic !== undefined) cambios["bic"] = c.bic;
    if (c.entidad !== undefined) cambios["entidad"] = c.entidad;
    if (c.agencia !== undefined) cambios["agencia"] = c.agencia;
    if (c.digitoControl !== undefined) cambios["digito_control"] = c.digitoControl;
    if (c.cuenta !== undefined) cambios["cuenta"] = c.cuenta;
    return cambios;
};

export const getCuentaBancaria: GetCuentaBancaria = async (id) => {
    return await RestAPI.getItem<CuentaBancaria, CuentaBancariaApi>(
        `${baseUrl}/${id}`,
        cuentaBancariaDesdeApi,
    );
};

export const getCuentasBancarias: GetCuentasBancarias = async (criteria) => {
    return await RestAPI.getQuery<CuentaBancaria, CuentaBancariaApi>(
        baseUrl,
        criteria,
        cuentaBancariaDesdeApi,
    );
};

export const postCuentaBancaria: PostCuentaBancaria = async (nueva) => {
    const respuesta = await RestAPI.post<NuevaCuentaBancariaApi>(
        baseUrl,
        nuevaCuentaBancariaAApi(nueva),
        "Error al crear cuenta bancaria",
    );
    return respuesta.id;
};

export const patchCuentaBancaria: PatchCuentaBancaria = async (id, cambios) => {
    await RestAPI.patch<CambiosCuentaBancariaApi>(
        `${baseUrl}/${id}`,
        cambiosCuentaBancariaAApi(cambios),
        "Error al actualizar cuenta bancaria",
    );
};

export const deleteCuentaBancaria: DeleteCuentaBancaria = async (id) => {
    await RestAPI.delete(
        `${baseUrl}/${id}`,
        "Error al eliminar cuenta bancaria",
    );
};
