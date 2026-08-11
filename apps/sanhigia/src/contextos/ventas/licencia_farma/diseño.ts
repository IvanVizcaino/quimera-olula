import { Entidad } from "@olula/lib/diseño.ts";

export type TratoAPI = {
    id: string;
    estado: string;
    titulo: string;
};

export type Trato = {
    id: string;
    estado: string;
    titulo: string;
};

export interface CabeceraLicenciaFarma extends Entidad {
    id: string;
    tipoLicencia: string | null;
    fechaCaducidad: string | null;
    fechaInicio: string | null;
    nombreCliente: string | null;
    agenteId: string | null;
};

export interface LicenciaFarma extends CabeceraLicenciaFarma {
    fechaRevisionDatos: string | null;
    fechaRecepcionAcuerdos: string | null;
    fechaEnvioDocumentacion: string | null;
    fechaFin: string | null;
    tratoId: string | null;
    estado: string | null;
    clienteId: string | null;
    nombreAgente: string | null;
    trato: Trato | null;
}

export interface CabeceraLicenciaFarmaAPI {
    id: string;
    tipo_licencia: string | null;
    fecha_caducidad: string | null;
    fecha_inicio: string | null;
    nombre_cliente: string | null;
    agente_id: string | null;
}

export interface LicenciaFarmaAPI extends CabeceraLicenciaFarmaAPI {
    fecha_revision_datos: string | null;
    fecha_recepcion_acuerdos: string | null;
    fecha_envio_documentacion: string | null;
    fecha_fin: string | null;
    trato_id: string | null;
    estado: string | null;
    cliente_id: string | null;
    nombre_agente: string | null;
    trato: TratoAPI | null;
}

export type NuevaLicenciaFarma = {
    tipoLicencia: string | null;
    fechaCaducidad: string | null;
    tratoId: string | null;
    clienteId: string | null;
    nombreCliente: string;
    agenteId: string | null;
};
