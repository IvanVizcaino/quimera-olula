import { ProcesarContexto } from "@olula/lib/diseño.js";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.js";
import {
    desvincularContactoCliente,
    vincularContactoCliente,
} from "../../../../crm/cliente/infraestructura.ts";
import { CrmContacto, NuevoCrmContacto } from "../../diseño.ts";
import {
    deleteCrmContacto,
    getCrmContactosCliente,
    patchCrmContacto,
    postCrmContacto,
} from "../../infraestructura.ts";
import { ContextoCrmContactos, EstadoCrmContactos } from "./diseño.ts";

export const metaCrmContacto: MetaModelo<CrmContacto> = {
    campos: {
        nombre: { requerido: true },
        email: { requerido: true, tipo: "email" },
    }
};

export const metaNuevoCrmContacto: MetaModelo<NuevoCrmContacto> = {
    campos: {
        nombre: { requerido: true },
        email: { requerido: true, tipo: "email" },
    }
};

export const nuevoCrmContactoVacio: NuevoCrmContacto = {
    nombre: '',
    email: '',
}

export const metaTablaCrmContactos = [
    { id: "id", cabecera: "ID" },
    { id: "nombre", cabecera: "Nombre" },
    { id: "email", cabecera: "Email" },
];


type ProcesarCrmContactos = ProcesarContexto<EstadoCrmContactos, ContextoCrmContactos>;

const pipeCrmContactos = ejecutarListaProcesos<EstadoCrmContactos, ContextoCrmContactos>;

export const cargarCrmContactos: ProcesarCrmContactos = async (contexto, payload) => {
    const clienteId = (payload as string) || contexto.clienteId;
    const contactos = await getCrmContactosCliente(clienteId);
    return {
        ...contexto,
        clienteId,
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
    const nuevoContacto = payload as CrmContacto;
    await postCrmContacto(nuevoContacto);

    return pipeCrmContactos(contexto, [
        cargarCrmContactos,
    ]);
}

export const actualizarContacto: ProcesarCrmContactos = async (contexto, payload) => {
    const contactoActualizado = payload as CrmContacto;
    await patchCrmContacto(contactoActualizado);

    return pipeCrmContactos(contexto, [
        cargarCrmContactos,
    ]);
}

export const borrarContacto: ProcesarCrmContactos = async (contexto) => {
    const idContacto = contexto.contactoActivo?.id;
    if (!idContacto) return contexto;

    await deleteCrmContacto(idContacto);

    return pipeCrmContactos(contexto, [
        cargarCrmContactos,
        'lista'
    ]);
}

export const vincularContacto: ProcesarCrmContactos = async (contexto, payload) => {
    const idContactoCrm = payload as string;
    await vincularContactoCliente(contexto.clienteId, idContactoCrm);

    return pipeCrmContactos(contexto, [
        cargarCrmContactos,
    ]);
}

export const desvincularContacto: ProcesarCrmContactos = async (contexto) => {
    const idContacto = contexto.contactoActivo?.id;
    if (!idContacto) return contexto;

    await desvincularContactoCliente(contexto.clienteId, idContacto);

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
