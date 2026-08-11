import { MetaTabla } from "@olula/componentes/index.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { MotivoDevolucion } from "../diseño.ts";

export type EstadoMaestroMotivoDevolucion =
    | "INICIAL"
    | "CREANDO_MOTIVO_DEVOLUCION";

export type ContextoMaestroMotivoDevolucion = {
    estado: EstadoMaestroMotivoDevolucion;
    motivosDevolucion: ListaActivaEntidades<MotivoDevolucion>;
};

export const metaTablaMotivoDevolucion: MetaTabla<MotivoDevolucion> = [
    { id: "tipo", cabecera: "Tipo" },
    { id: "descripcion", cabecera: "Descripción" },
    { id: "otros", cabecera: "Otros", tipo: "booleano" },
];