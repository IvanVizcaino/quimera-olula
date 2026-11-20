import { ProcesarContexto } from "@olula/lib/diseño.js";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.js";
import { CrmContacto, NuevoCrmContacto } from "../../diseño.ts";
import { ContextoCrmContactos, EstadoCrmContactos } from "./diseño.ts";

// Longitudes de las columnas de crm_contactos (crm_contactos.mtd).
const longitud = (campo: keyof NuevoCrmContacto, maximo: number) =>
    (modelo: NuevoCrmContacto) =>
        String(modelo[campo] ?? "").length <= maximo || `Como mucho ${maximo} caracteres`;

const camposContacto = {
    nombre: { requerido: true, validacion: longitud("nombre", 100) },
    cargo: { requerido: false, validacion: longitud("cargo", 100) },
    email: { requerido: false, tipo: "email" as const, validacion: longitud("email", 50) },
    telefono1: { requerido: false, tipo: "telefono" as const, validacion: longitud("telefono1", 30) },
    telefono2: { requerido: false, tipo: "telefono" as const, validacion: longitud("telefono2", 30) },
    observaciones: { requerido: false },
};

export const metaCrmContacto: MetaModelo<CrmContacto> = { campos: camposContacto };

export const metaNuevoCrmContacto: MetaModelo<NuevoCrmContacto> = { campos: camposContacto };

export const nuevoCrmContactoVacio: NuevoCrmContacto = {
    nombre: '',
    cargo: '',
    email: '',
    telefono1: '',
    telefono2: '',
    observaciones: '',
}

export const metaTablaCrmContactos = [
    { id: "id", cabecera: "Código" },
    { id: "nombre", cabecera: "Nombre" },
    { id: "cargo", cabecera: "Cargo" },
    { id: "email", cabecera: "Email" },
    { id: "telefono1", cabecera: "Teléfono 1" },
    { id: "telefono2", cabecera: "Teléfono 2" },
];


type ProcesarCrmContactos = ProcesarContexto<EstadoCrmContactos, ContextoCrmContactos>;

const pipeCrmContactos = ejecutarListaProcesos<EstadoCrmContactos, ContextoCrmContactos>;

export const cargarCrmContactos: ProcesarCrmContactos = async (contexto, payload) => {
    const entidadId = (payload as string) || contexto.entidadId;
    const contactos = await contexto.api.cargar(entidadId);
    return {
        ...contexto,
        entidadId,
        contactos,
        cargando: false,
    }
}

export const activarContacto: ProcesarCrmContactos = async (contexto, payload) => {
    const contactoActivo = payload as CrmContacto;
    return {
        ...contexto,
        contactoActivo
    }
}

export const crearContacto: ProcesarCrmContactos = async (contexto, payload) => {
    const nuevoContacto = payload as NuevoCrmContacto;
    await contexto.api.crear(contexto.entidadId, nuevoContacto);

    return pipeCrmContactos(contexto, [
        cargarCrmContactos,
    ]);
}

export const actualizarContacto: ProcesarCrmContactos = async (contexto, payload) => {
    const contactoActualizado = payload as CrmContacto;
    await contexto.api.cambiar(contactoActualizado);

    return pipeCrmContactos(contexto, [
        cargarCrmContactos,
    ]);
}

export const borrarContacto: ProcesarCrmContactos = async (contexto) => {
    const idContacto = contexto.contactoActivo?.id;
    if (!idContacto) return contexto;

    await contexto.api.borrar(idContacto);

    return pipeCrmContactos(contexto, [
        cargarCrmContactos,
        'lista'
    ]);
}

export const vincularContacto: ProcesarCrmContactos = async (contexto, payload) => {
    const idContactoCrm = payload as string;
    await contexto.api.vincular(idContactoCrm, contexto.entidadId);

    return pipeCrmContactos(contexto, [
        cargarCrmContactos,
    ]);
}

export const desvincularContacto: ProcesarCrmContactos = async (contexto) => {
    const idContacto = contexto.contactoActivo?.id;
    if (!idContacto) return contexto;

    await contexto.api.desvincular(idContacto, contexto.entidadId);

    return pipeCrmContactos(contexto, [
        cargarCrmContactos,
    ]);
}

export const cancelarAlta: ProcesarCrmContactos = async (contexto) => {
    return {
        ...contexto,
        contactoActivo: null,
        estado: "lista"
    }
}

export const cancelarEdicion: ProcesarCrmContactos = async (contexto) => {
    return {
        ...contexto,
        contactoActivo: null,
        estado: "lista"
    }
}

export const cancelarConfirmacion: ProcesarCrmContactos = async (contexto) => {
    return {
        ...contexto,
        estado: "lista"
    };
}
