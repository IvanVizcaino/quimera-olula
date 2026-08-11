import { ListaEntidades } from "@olula/lib/ListaEntidades.js";
import { DirCliente } from "../../diseño.ts";

export type EstadoDirecciones = "lista" | "alta" | "edicion" | "confirmar_borrado";

export type ContextoDirecciones = {
    estado: EstadoDirecciones;
    direcciones: ListaEntidades<DirCliente>;
    cargando: boolean;
    clienteId: string;
};
