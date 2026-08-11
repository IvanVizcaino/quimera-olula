import { MetaTabla } from "@olula/componentes/index.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Comunicacion } from "../diseño.ts";

export type EstadoMaestroComunicacion = "INICIAL" | "CREANDO_COMUNICACION";

export type ContextoMaestroComunicacion = {
    estado: EstadoMaestroComunicacion;
    comunicaciones: ListaActivaEntidades<Comunicacion>;
};

export const metaTablaComunicacion: MetaTabla<Comunicacion> = [
    { id: "asunto", cabecera: "Asunto" },
    { id: "fechaEnvio", cabecera: "Enviada", tipo: "fechahora" },
];
