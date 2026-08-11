import { EstadoModelo, initEstadoModelo, MetaModelo } from "@olula/lib/dominio.ts";
import { CabeceraLicenciaFarma, LicenciaFarma, NuevaLicenciaFarma } from "./diseño.ts";

export const cabeceraLicenciaFarmaVacia: CabeceraLicenciaFarma = {
    id: '',
    tipoLicencia: '',
    fechaCaducidad: '',
    fechaInicio: null,
    nombreCliente: null,
    agenteId: null,
};

export const licenciaFarmaVacia: LicenciaFarma = {
    id: '',
    tipoLicencia: '',
    fechaCaducidad: '',
    fechaInicio: null,
    fechaRevisionDatos: null,
    fechaRecepcionAcuerdos: null,
    fechaEnvioDocumentacion: null,
    fechaFin: null,
    tratoId: null,
    estado: null,
    nombreCliente: null,
    clienteId: null,
    agenteId: null,
    nombreAgente: null,
    trato: null,
};

export const nuevaLicenciaFarmaVacia: NuevaLicenciaFarma = {
    tipoLicencia: '',
    fechaCaducidad: '',
    tratoId: null,
    clienteId: null,
    nombreCliente: '',
    agenteId: null,
};

export const metaLicenciaFarma: MetaModelo<LicenciaFarma> = {
    campos: {
        nombreCliente: { requerido: true, tipo: "texto" },
        agenteId: { requerido: true, tipo: "texto" },
    },
};

export const metaNuevaLicenciaFarma: MetaModelo<NuevaLicenciaFarma> = {
    campos: {
        nombreCliente: { requerido: true, tipo: "texto" },
        agenteId: { requerido: true, tipo: "texto" },
    },
};

export const initEstadoLicenciaFarma = (licencia: LicenciaFarma): EstadoModelo<LicenciaFarma> =>
    initEstadoModelo(licencia);

export const initEstadoLicenciaFarmaVacia = () => initEstadoLicenciaFarma(licenciaFarmaVacia);
