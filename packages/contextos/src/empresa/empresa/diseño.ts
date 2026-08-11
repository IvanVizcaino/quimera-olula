import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/**
 * Empresa (/empresa/empresa).
 *
 * La API expone la dirección como objeto anidado (`direccion`). En el dominio
 * la aplanamos en campos de primer nivel para poder editarla con `uiProps`
 * (que solo accede a `modelo[campo]`, sin rutas anidadas). El mapper de
 * infraestructura reconstruye/descompone el objeto `direccion`.
 */
export interface Empresa extends Entidad {
    id: string;
    nombre: string;
    cifNif: string;
    administrador: string;
    ejercicioId: string;
    telefono: string;
    email: string;
    web: string;
    serieId: string;
    formaPagoId: string;
    divisaId: string;
    almacenId: string;

    // Dirección (aplanada)
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
}

/**
 * Tipo para crear nueva empresa (sin id).
 */
export interface NuevaEmpresa extends Modelo {
    nombre: string;
    cifNif: string;
    administrador: string;
    ejercicioId: string;
    telefono: string;
    email: string;
    web: string;
    serieId: string;
    formaPagoId: string;
    divisaId: string;
    almacenId: string;

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
}

export type CambiosEmpresa = Partial<Empresa>;

/**
 * Contratos de infraestructura.
 */
export type GetEmpresa = (id: string) => Promise<Empresa>;

export type GetEmpresas = (criteria: Criteria) => RespuestaLista<Empresa>;

export type PostEmpresa = (nueva: NuevaEmpresa) => Promise<string>;

export type PatchEmpresa = (id: string, cambios: CambiosEmpresa) => Promise<void>;

export type DeleteEmpresa = (id: string) => Promise<void>;
