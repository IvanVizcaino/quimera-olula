import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/** Fila de `sucursales`. */
export type DatosSucursal = {
    agencia: string;
    nombre: string;
    direccion: string;
    codigoPostal: string;
    apartado: string;
    poblacion: string;
    provincia: string;
    paisId: string;
    telefono: string;
    fax: string;
    contacto: string;
    observaciones: string;
};

export interface Sucursal extends Entidad, DatosSucursal {
    id: string;
}

export type NuevaSucursal = DatosSucursal & Modelo;

export interface DatosBanco {
    id: string;
    nombre: string;
    proveedorId: string;
    bicDefecto: string;
}

/** Eneboo `bancos` con sus `sucursales`. */
export interface Banco extends Entidad, DatosBanco {
    id: string;
    nombreProveedor: string;
    sucursales: Sucursal[];
}

export type NuevoBanco = DatosBanco & Modelo;

export type CambiosBanco = Partial<Omit<DatosBanco, "id">>;
export type CambiosSucursal = Partial<DatosSucursal>;

export type GetBancos = (criteria: Criteria) => RespuestaLista<Banco>;
export type GetBanco = (id: string) => Promise<Banco>;
export type PostBanco = (nuevo: NuevoBanco) => Promise<string>;
export type PatchBanco = (id: string, cambios: CambiosBanco) => Promise<void>;
export type DeleteBanco = (id: string) => Promise<void>;
export type PostSucursal = (bancoId: string, nueva: NuevaSucursal) => Promise<string>;
export type PatchSucursal = (bancoId: string, sucursalId: string, cambios: CambiosSucursal) => Promise<void>;
export type DeleteSucursal = (bancoId: string, sucursalId: string) => Promise<void>;
