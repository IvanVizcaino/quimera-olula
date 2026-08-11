import { contactoVacio } from "#/crm/contacto/detalle/detalle.ts";
import { Contacto } from "#/crm/contacto/diseño.ts";
import { Maquina, ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos } from "@olula/lib/dominio.ts";
import { getContacto } from "../../contacto/infraestructura.ts";


export const getMaquina: () => Maquina<EstadoContactoCrm, ContextoContactoCrm> = () => {
    return {
        INICIAL: {
            contacto_id_cambiado: [cargarContexto],
            alta_solicitada: "CREANDO",
            edicion_solicitada: "EDITANDO",
        },
        CREANDO: {
            contacto_creado: [refrescarContactoCrm, "INICIAL"],
            creacion_cancelada: "INICIAL",
        },
        EDITANDO: {
            contacto_cambiado: [refrescarContactoCrm],
            edicion_cancelada: "INICIAL"
        }
    };
};

export type EstadoContactoCrm = "INICIAL" | "CREANDO" | "EDITANDO";
export type ContextoContactoCrm = {
    estado: EstadoContactoCrm,
    contacto: Contacto;
}

export type ProcesarContactoCrm = ProcesarContexto<EstadoContactoCrm, ContextoContactoCrm>;
const pipeContactoCrm = ejecutarListaProcesos<EstadoContactoCrm, ContextoContactoCrm>;

export const refrescarContactoCrm: ProcesarContactoCrm = async (contexto, payload) => {
    const datos = payload as Contacto;
    const contacto = await getContacto(datos.id ?? contexto.contacto.id);

    return {
        ...contexto,
        contacto: {
            ...contexto.contacto,
            ...contacto
        },
    };
};

const cargarContactoCrm: (_: string) => ProcesarContactoCrm = (contactoId) =>
    async (contexto) => {
        const contacto = await getContacto(contactoId);
        return {
            ...contexto,
            contacto,
        }
    }

export const getContextoVacio: ProcesarContactoCrm = async (contexto) => {

    return {
        ...contexto,
        estado: 'INICIAL',
        contacto: contactoVacio,
    }
}

export const cargarContexto: ProcesarContactoCrm = async (contexto, payload) => {
    const contactoId = payload as string;

    if (contactoId) {
        return pipeContactoCrm(
            contexto,
            [
                cargarContactoCrm(contactoId),
            ],
            payload
        );
    } else {
        return getContextoVacio(contexto);
    }
}