import { CrmContacto } from "../../diseño.ts";

export type EstadoCrmContactos = "lista" | "alta" | "edicion" | "confirmar_borrado" | "confirmar_eliminar_asociacion" | "asociar";

export type ContextoCrmContactos = {
    estado: EstadoCrmContactos;
    contactos: CrmContacto[];
    contactoActivo: CrmContacto | null;
    cargando: boolean;
    clienteId: string;
};
