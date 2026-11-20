import { ApiAgenda } from "#/comun/agenda/infraestructura.ts";
import { CrmContacto } from "../../diseño.ts";

export type EstadoCrmContactos = "lista" | "alta" | "edicion" | "confirmar_borrado" | "confirmar_eliminar_asociacion" | "asociar";

export type ContextoCrmContactos = {
    estado: EstadoCrmContactos;
    contactos: CrmContacto[];
    contactoActivo: CrmContacto | null;
    cargando: boolean;
    /** Cliente o proveedor de la agenda. */
    entidadId: string;
    api: ApiAgenda;
};
