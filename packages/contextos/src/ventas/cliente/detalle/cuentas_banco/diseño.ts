import { ListaEntidades } from "@olula/lib/ListaEntidades.js";
import { CuentaBanco } from "../../diseño.ts";

export type EstadoCuentasBanco = "lista" | "alta" | "edicion" | "confirmar_borrado" | "remesa";

export type ContextoCuentasBanco = {
    estado: EstadoCuentasBanco;
    cuentas: ListaEntidades<CuentaBanco>;
    cargando: boolean;
    clienteId: string;
};
